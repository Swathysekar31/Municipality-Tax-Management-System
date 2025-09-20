import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/citizen/[id]/tax - Get citizen tax details
export const GET = withAuth(async (req: NextRequest & { user: any }, { params }: { params: { id: string } }) => {
  try {
    const citizen_id = Number.parseInt(params.id)

    if (isNaN(citizen_id)) {
      return NextResponse.json({ error: "Invalid citizen ID" }, { status: 400 })
    }

    // Verify citizen access (citizens can only access their own data)
    if (req.user.type === "citizen" && req.user.id !== citizen_id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const citizen = await prisma.citizen.findUnique({
      where: { citizen_id },
      include: {
        district: true,
        taxRecords: {
          include: {
            payments: {
              where: { status: "completed" },
              orderBy: { payment_date: "desc" },
            },
            penalties: {
              where: { status: "active" },
            },
          },
          orderBy: { tax_year: "desc" },
        },
      },
    })

    if (!citizen) {
      return NextResponse.json({ error: "Citizen not found" }, { status: 404 })
    }

    // Calculate totals
    const totalTaxAmount = citizen.taxRecords.reduce((sum, record) => sum + record.amount, 0)
    const totalPaidAmount = citizen.taxRecords
      .filter((record) => record.status === "paid")
      .reduce((sum, record) => sum + record.amount, 0)
    const totalPendingAmount = citizen.taxRecords
      .filter((record) => record.status !== "paid")
      .reduce((sum, record) => sum + record.amount, 0)
    const totalPenalties = citizen.taxRecords.reduce(
      (sum, record) => sum + record.penalties.reduce((penaltySum, penalty) => penaltySum + penalty.penalty_amount, 0),
      0,
    )

    return NextResponse.json({
      success: true,
      data: {
        citizen_info: {
          citizen_id: citizen.citizen_id,
          customer_id: citizen.customer_id,
          name: citizen.name,
          ward_no: citizen.ward_no,
          district: citizen.district.district_name,
          city: citizen.city,
          state: citizen.state,
          contact_no: citizen.contact_no,
        },
        tax_summary: {
          total_tax_amount: totalTaxAmount,
          total_paid_amount: totalPaidAmount,
          total_pending_amount: totalPendingAmount,
          total_penalties: totalPenalties,
          total_records: citizen.taxRecords.length,
          paid_records: citizen.taxRecords.filter((record) => record.status === "paid").length,
          pending_records: citizen.taxRecords.filter((record) => record.status !== "paid").length,
        },
        tax_records: citizen.taxRecords.map((record) => ({
          tax_id: record.tax_id,
          tax_year: record.tax_year,
          amount: record.amount,
          due_date: record.due_date,
          status: record.status,
          is_overdue:
            record.status === "overdue" || (record.status === "unpaid" && new Date() > new Date(record.due_date)),
          days_overdue:
            record.status === "overdue" || (record.status === "unpaid" && new Date() > new Date(record.due_date))
              ? Math.floor((Date.now() - new Date(record.due_date).getTime()) / (1000 * 60 * 60 * 24))
              : 0,
          penalty_amount: record.penalties.reduce((sum, penalty) => sum + penalty.penalty_amount, 0),
          last_payment:
            record.payments.length > 0
              ? {
                  payment_id: record.payments[0].payment_id,
                  payment_date: record.payments[0].payment_date,
                  payment_mode: record.payments[0].payment_mode,
                  receipt_no: record.payments[0].receipt_no,
                  amount: record.payments[0].amount,
                }
              : null,
        })),
      },
    })
  } catch (error) {
    console.error("Get citizen tax details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
