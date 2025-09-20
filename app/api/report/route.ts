import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/report - Get all tax reports with filters
export const GET = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // paid, unpaid, overdue
    const district_id = searchParams.get("district_id")
    const tax_year = searchParams.get("tax_year")
    const search = searchParams.get("search")

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (district_id) {
      where.citizen = {
        district_id: Number.parseInt(district_id),
      }
    }

    if (tax_year) {
      where.tax_year = tax_year
    }

    if (search) {
      where.citizen = {
        ...where.citizen,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { customer_id: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const taxRecords = await prisma.taxRecord.findMany({
      where,
      include: {
        citizen: {
          include: {
            district: true,
          },
        },
        payments: {
          where: { status: "completed" },
        },
        penalties: {
          where: { status: "active" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate summary statistics
    const totalRecords = taxRecords.length
    const paidRecords = taxRecords.filter((record) => record.status === "paid").length
    const unpaidRecords = taxRecords.filter((record) => record.status === "unpaid").length
    const overdueRecords = taxRecords.filter((record) => record.status === "overdue").length

    const totalAmount = taxRecords.reduce((sum, record) => sum + record.amount, 0)
    const collectedAmount = taxRecords
      .filter((record) => record.status === "paid")
      .reduce((sum, record) => sum + record.amount, 0)
    const pendingAmount = totalAmount - collectedAmount

    const totalPenalties = taxRecords.reduce(
      (sum, record) => sum + record.penalties.reduce((penaltySum, penalty) => penaltySum + penalty.penalty_amount, 0),
      0,
    )

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_records: totalRecords,
          paid_records: paidRecords,
          unpaid_records: unpaidRecords,
          overdue_records: overdueRecords,
          total_amount: totalAmount,
          collected_amount: collectedAmount,
          pending_amount: pendingAmount,
          total_penalties: totalPenalties,
          collection_rate: totalRecords > 0 ? ((paidRecords / totalRecords) * 100).toFixed(2) : "0.00",
        },
        records: taxRecords.map((record) => ({
          tax_id: record.tax_id,
          citizen: {
            citizen_id: record.citizen.citizen_id,
            customer_id: record.citizen.customer_id,
            name: record.citizen.name,
            ward_no: record.citizen.ward_no,
            district: record.citizen.district.district_name,
            contact_no: record.citizen.contact_no,
          },
          tax_year: record.tax_year,
          amount: record.amount,
          due_date: record.due_date,
          status: record.status,
          payment_info:
            record.payments.length > 0
              ? {
                  payment_date: record.payments[0].payment_date,
                  payment_mode: record.payments[0].payment_mode,
                  receipt_no: record.payments[0].receipt_no,
                }
              : null,
          penalty_amount: record.penalties.reduce((sum, penalty) => sum + penalty.penalty_amount, 0),
          days_overdue:
            record.status === "overdue"
              ? Math.floor((Date.now() - new Date(record.due_date).getTime()) / (1000 * 60 * 60 * 24))
              : 0,
          createdAt: record.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")
