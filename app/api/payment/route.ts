import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth, generateReceiptNumber } from "@/lib/middleware"

// POST /api/payment - Make payment (online/offline)
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { tax_id, payment_mode, amount } = await req.json()

    if (!tax_id || !payment_mode || !amount) {
      return NextResponse.json({ error: "Tax ID, payment mode, and amount are required" }, { status: 400 })
    }

    if (!["online", "offline"].includes(payment_mode)) {
      return NextResponse.json({ error: "Payment mode must be 'online' or 'offline'" }, { status: 400 })
    }

    // Get tax record with citizen info
    const taxRecord = await prisma.taxRecord.findUnique({
      where: { tax_id: Number.parseInt(tax_id) },
      include: {
        citizen: {
          include: {
            district: true,
          },
        },
        penalties: {
          where: { status: "active" },
        },
      },
    })

    if (!taxRecord) {
      return NextResponse.json({ error: "Tax record not found" }, { status: 404 })
    }

    // Verify citizen access (citizens can only pay their own taxes)
    if (req.user.type === "citizen" && req.user.id !== taxRecord.citizen_id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (taxRecord.status === "paid") {
      return NextResponse.json({ error: "Tax already paid" }, { status: 409 })
    }

    // Calculate total amount including penalties
    const penaltyAmount = taxRecord.penalties.reduce((sum, penalty) => sum + penalty.penalty_amount, 0)
    const totalAmount = taxRecord.amount + penaltyAmount

    if (Number.parseFloat(amount) !== totalAmount) {
      return NextResponse.json(
        {
          error: "Payment amount mismatch",
          expected_amount: totalAmount,
          breakdown: {
            tax_amount: taxRecord.amount,
            penalty_amount: penaltyAmount,
            total_amount: totalAmount,
          },
        },
        { status: 400 },
      )
    }

    // Generate unique receipt number
    let receipt_no: string
    let isUnique = false

    do {
      receipt_no = generateReceiptNumber()
      const existing = await prisma.payment.findUnique({
        where: { receipt_no },
      })
      isUnique = !existing
    } while (!isUnique)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        tax_id: taxRecord.tax_id,
        citizen_id: taxRecord.citizen_id,
        payment_mode,
        receipt_no,
        amount: totalAmount,
        status: "completed",
      },
    })

    // Update tax record status to paid
    await prisma.taxRecord.update({
      where: { tax_id: taxRecord.tax_id },
      data: { status: "paid" },
    })

    // Mark penalties as paid
    if (taxRecord.penalties.length > 0) {
      await prisma.penalty.updateMany({
        where: {
          tax_id: taxRecord.tax_id,
          status: "active",
        },
        data: { status: "paid" },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        payment_id: payment.payment_id,
        receipt_no: payment.receipt_no,
        tax_id: taxRecord.tax_id,
        citizen: {
          customer_id: taxRecord.citizen.customer_id,
          name: taxRecord.citizen.name,
          district: taxRecord.citizen.district.district_name,
        },
        tax_year: taxRecord.tax_year,
        payment_date: payment.payment_date,
        payment_mode: payment.payment_mode,
        amount_breakdown: {
          tax_amount: taxRecord.amount,
          penalty_amount: penaltyAmount,
          total_amount: totalAmount,
        },
        status: payment.status,
      },
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
