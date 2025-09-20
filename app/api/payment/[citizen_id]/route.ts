import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/payment/[citizen_id] - Get payment history
export const GET = withAuth(
  async (req: NextRequest & { user: any }, { params }: { params: { citizen_id: string } }) => {
    try {
      const citizen_id = Number.parseInt(params.citizen_id)

      if (isNaN(citizen_id)) {
        return NextResponse.json({ error: "Invalid citizen ID" }, { status: 400 })
      }

      // Verify citizen access (citizens can only access their own data)
      if (req.user.type === "citizen" && req.user.id !== citizen_id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      const payments = await prisma.payment.findMany({
        where: { citizen_id },
        include: {
          taxRecord: true,
          citizen: {
            include: {
              district: true,
            },
          },
        },
        orderBy: { payment_date: "desc" },
      })

      if (payments.length === 0) {
        return NextResponse.json({ error: "No payment history found" }, { status: 404 })
      }

      // Calculate summary
      const totalPayments = payments.length
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const onlinePayments = payments.filter((payment) => payment.payment_mode === "online").length
      const offlinePayments = payments.filter((payment) => payment.payment_mode === "offline").length

      return NextResponse.json({
        success: true,
        data: {
          citizen_info: {
            customer_id: payments[0].citizen.customer_id,
            name: payments[0].citizen.name,
            district: payments[0].citizen.district.district_name,
          },
          payment_summary: {
            total_payments: totalPayments,
            total_amount: totalAmount,
            online_payments: onlinePayments,
            offline_payments: offlinePayments,
          },
          payments: payments.map((payment) => ({
            payment_id: payment.payment_id,
            receipt_no: payment.receipt_no,
            tax_year: payment.taxRecord.tax_year,
            payment_date: payment.payment_date,
            payment_mode: payment.payment_mode,
            amount: payment.amount,
            status: payment.status,
            tax_amount: payment.taxRecord.amount,
          })),
        },
      })
    } catch (error) {
      console.error("Get payment history error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  },
)
