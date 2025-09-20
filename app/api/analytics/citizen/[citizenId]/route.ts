import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyCitizenToken } from "@/lib/middleware"

export async function GET(request: NextRequest, { params }: { params: { citizenId: string } }) {
  try {
    // Verify citizen authentication
    const authResult = await verifyCitizenToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const citizenId = Number.parseInt(params.citizenId)

    // Verify citizen can access their own data
    if (authResult.citizenId !== citizenId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Get citizen with all related data
    const citizen = await prisma.citizen.findUnique({
      where: { id: citizenId },
      include: {
        taxRecords: {
          orderBy: { taxYear: "desc" },
        },
        payments: {
          include: {
            taxRecord: true,
          },
          orderBy: { paymentDate: "desc" },
        },
        penalties: {
          include: {
            taxRecord: true,
          },
          orderBy: { appliedDate: "desc" },
        },
        reminders: {
          orderBy: { sentAt: "desc" },
          take: 10,
        },
        district: true,
      },
    })

    if (!citizen) {
      return NextResponse.json({ error: "Citizen not found" }, { status: 404 })
    }

    // Calculate analytics
    const totalTaxPaid = citizen.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, payment) => sum + payment.amount, 0)

    const totalPendingTax = citizen.taxRecords
      .filter((tax) => tax.status === "PENDING")
      .reduce((sum, tax) => sum + tax.amount, 0)

    const totalPenalties = citizen.penalties
      .filter((penalty) => penalty.status === "ACTIVE")
      .reduce((sum, penalty) => sum + penalty.amount, 0)

    // Payment history by year
    const paymentHistory = citizen.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce(
        (acc, payment) => {
          const year = payment.taxRecord.taxYear
          if (!acc[year]) {
            acc[year] = { year, amount: 0, count: 0 }
          }
          acc[year].amount += payment.amount
          acc[year].count += 1
          return acc
        },
        {} as Record<number, { year: number; amount: number; count: number }>,
      )

    // Tax trend over years
    const taxTrend = citizen.taxRecords.map((tax) => ({
      year: tax.taxYear,
      amount: tax.amount,
      status: tax.status,
      dueDate: tax.dueDate,
      paidDate: tax.paidDate,
    }))

    // Payment methods used
    const paymentMethods = citizen.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce(
        (acc, payment) => {
          const method = payment.method
          if (!acc[method]) {
            acc[method] = { method, count: 0, amount: 0 }
          }
          acc[method].count += 1
          acc[method].amount += payment.amount
          return acc
        },
        {} as Record<string, { method: string; count: number; amount: number }>,
      )

    return NextResponse.json({
      success: true,
      data: {
        citizen: {
          id: citizen.id,
          name: citizen.name,
          customerId: citizen.customerId,
          email: citizen.email,
          phone: citizen.phone,
          address: citizen.address,
          wardNo: citizen.wardNo,
          district: citizen.district.name,
        },
        overview: {
          totalTaxPaid,
          totalPendingTax,
          totalPenalties,
          totalTaxRecords: citizen.taxRecords.length,
          totalPayments: citizen.payments.filter((p) => p.status === "COMPLETED").length,
          activePenalties: citizen.penalties.filter((p) => p.status === "ACTIVE").length,
        },
        charts: {
          paymentHistory: Object.values(paymentHistory).sort((a, b) => a.year - b.year),
          taxTrend: taxTrend.sort((a, b) => a.year - b.year),
          paymentMethods: Object.values(paymentMethods),
        },
        recentActivities: {
          payments: citizen.payments
            .filter((p) => p.status === "COMPLETED")
            .slice(0, 5)
            .map((payment) => ({
              id: payment.id,
              amount: payment.amount,
              method: payment.method,
              date: payment.paymentDate,
              receiptNumber: payment.receiptNumber,
              taxYear: payment.taxRecord.taxYear,
            })),
          penalties: citizen.penalties.slice(0, 5).map((penalty) => ({
            id: penalty.id,
            amount: penalty.amount,
            reason: penalty.reason,
            date: penalty.appliedDate,
            status: penalty.status,
            taxYear: penalty.taxRecord?.taxYear,
          })),
          reminders: citizen.reminders.slice(0, 5).map((reminder) => ({
            id: reminder.id,
            message: reminder.message,
            type: reminder.type,
            status: reminder.status,
            date: reminder.sentAt,
          })),
        },
      },
    })
  } catch (error) {
    console.error("Citizen analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch citizen analytics" }, { status: 500 })
  }
}
