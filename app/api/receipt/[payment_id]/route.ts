import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/receipt/[payment_id] - Get receipt details
export const GET = withAuth(
  async (req: NextRequest & { user: any }, { params }: { params: { payment_id: string } }) => {
    try {
      const payment_id = Number.parseInt(params.payment_id)

      if (isNaN(payment_id)) {
        return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
      }

      const payment = await prisma.payment.findUnique({
        where: { payment_id },
        include: {
          taxRecord: true,
          citizen: {
            include: {
              district: true,
            },
          },
        },
      })

      if (!payment) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
      }

      // Verify citizen access (citizens can only access their own receipts)
      if (req.user.type === "citizen" && req.user.id !== payment.citizen_id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      // Get penalties that were paid with this tax record
      const penalties = await prisma.penalty.findMany({
        where: {
          tax_id: payment.tax_id,
          status: "paid",
        },
      })

      const penaltyAmount = penalties.reduce((sum, penalty) => sum + penalty.penalty_amount, 0)
      const taxAmount = payment.taxRecord.amount

      return NextResponse.json({
        success: true,
        data: {
          receipt_info: {
            receipt_no: payment.receipt_no,
            payment_id: payment.payment_id,
            payment_date: payment.payment_date,
            payment_mode: payment.payment_mode,
            status: payment.status,
          },
          citizen_info: {
            customer_id: payment.citizen.customer_id,
            name: payment.citizen.name,
            ward_no: payment.citizen.ward_no,
            district: payment.citizen.district.district_name,
            city: payment.citizen.city,
            state: payment.citizen.state,
            contact_no: payment.citizen.contact_no,
          },
          tax_info: {
            tax_id: payment.taxRecord.tax_id,
            tax_year: payment.taxRecord.tax_year,
            due_date: payment.taxRecord.due_date,
          },
          payment_breakdown: {
            tax_amount: taxAmount,
            penalty_amount: penaltyAmount,
            total_amount: payment.amount,
          },
          penalties: penalties.map((penalty) => ({
            penalty_id: penalty.penalty_id,
            penalty_amount: penalty.penalty_amount,
            penalty_date: penalty.penalty_date,
          })),
        },
      })
    } catch (error) {
      console.error("Get receipt details error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  },
)
