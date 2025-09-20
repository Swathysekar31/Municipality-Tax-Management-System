import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/tax/[citizen_id] - Get tax records for a citizen
export const GET = withAuth(
  async (req: NextRequest & { user: any }, { params }: { params: { citizen_id: string } }) => {
    try {
      const citizen_id = Number.parseInt(params.citizen_id)

      if (isNaN(citizen_id)) {
        return NextResponse.json({ error: "Invalid citizen ID" }, { status: 400 })
      }

      const taxRecords = await prisma.taxRecord.findMany({
        where: { citizen_id },
        include: {
          citizen: {
            include: {
              district: true,
            },
          },
          payments: true,
          penalties: true,
        },
        orderBy: { tax_year: "desc" },
      })

      if (taxRecords.length === 0) {
        return NextResponse.json({ error: "No tax records found for this citizen" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          citizen: {
            customer_id: taxRecords[0].citizen.customer_id,
            name: taxRecords[0].citizen.name,
            district: taxRecords[0].citizen.district.district_name,
          },
          tax_records: taxRecords.map((record) => ({
            tax_id: record.tax_id,
            tax_year: record.tax_year,
            amount: record.amount,
            due_date: record.due_date,
            status: record.status,
            payments: record.payments.map((payment) => ({
              payment_id: payment.payment_id,
              payment_date: payment.payment_date,
              payment_mode: payment.payment_mode,
              receipt_no: payment.receipt_no,
              amount: payment.amount,
              status: payment.status,
            })),
            penalties: record.penalties.map((penalty) => ({
              penalty_id: penalty.penalty_id,
              penalty_amount: penalty.penalty_amount,
              penalty_date: penalty.penalty_date,
              status: penalty.status,
            })),
            createdAt: record.createdAt,
          })),
        },
      })
    } catch (error) {
      console.error("Get citizen tax records error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  },
  "admin",
)
