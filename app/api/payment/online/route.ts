import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PaymentGateway } from "@/lib/payment-gateway"
import { verifyCitizenToken } from "@/lib/middleware"

export async function POST(request: NextRequest) {
  try {
    // Verify citizen authentication
    const authResult = await verifyCitizenToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { taxRecordId, paymentMethod = "online" } = body

    if (!taxRecordId) {
      return NextResponse.json({ error: "Tax record ID is required" }, { status: 400 })
    }

    // Get tax record with citizen details
    const taxRecord = await prisma.taxRecord.findUnique({
      where: { id: taxRecordId },
      include: {
        citizen: true,
        penalties: {
          where: { status: "ACTIVE" },
        },
      },
    })

    if (!taxRecord) {
      return NextResponse.json({ error: "Tax record not found" }, { status: 404 })
    }

    // Verify citizen owns this tax record
    if (taxRecord.citizenId !== authResult.citizenId) {
      return NextResponse.json({ error: "Unauthorized access to tax record" }, { status: 403 })
    }

    if (taxRecord.status === "PAID") {
      return NextResponse.json({ error: "Tax already paid" }, { status: 400 })
    }

    // Calculate total amount including penalties
    const penaltyAmount = taxRecord.penalties.reduce((sum, penalty) => sum + penalty.amount, 0)
    const totalAmount = taxRecord.amount + penaltyAmount

    const paymentGateway = PaymentGateway.getInstance()

    // Create payment session
    const paymentSession = await paymentGateway.createPaymentSession({
      amount: totalAmount,
      currency: "INR",
      description: `Tax Payment - ${taxRecord.taxYear}`,
      customerEmail: taxRecord.citizen.email,
      customerName: taxRecord.citizen.name,
      customerPhone: taxRecord.citizen.phone,
      metadata: {
        taxRecordId: taxRecord.id,
        citizenId: taxRecord.citizenId,
        taxYear: taxRecord.taxYear,
      },
    })

    // Store payment session in database for tracking
    const paymentRecord = await prisma.payment.create({
      data: {
        citizenId: taxRecord.citizenId,
        taxRecordId: taxRecord.id,
        amount: totalAmount,
        method: paymentMethod.toUpperCase(),
        status: "PENDING",
        receiptNumber: paymentGateway.generateReceiptNumber(),
        paymentDate: new Date(),
        gatewaySessionId: paymentSession.sessionId,
        expiresAt: paymentSession.expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Payment session created successfully",
      payment: {
        id: paymentRecord.id,
        amount: totalAmount,
        taxAmount: taxRecord.amount,
        penaltyAmount,
        receiptNumber: paymentRecord.receiptNumber,
        sessionId: paymentSession.sessionId,
        paymentUrl: paymentSession.paymentUrl,
        expiresAt: paymentSession.expiresAt,
      },
    })
  } catch (error) {
    console.error("Online payment creation error:", error)
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
  }
}
