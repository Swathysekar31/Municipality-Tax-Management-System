import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminToken } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year") || new Date().getFullYear().toString()

    // Get basic counts
    const [totalCitizens, totalDistricts, totalTaxRecords, totalPayments, totalPenalties] = await Promise.all([
      prisma.citizen.count(),
      prisma.district.count(),
      prisma.taxRecord.count({
        where: { taxYear: Number.parseInt(year) },
      }),
      prisma.payment.count({
        where: { status: "COMPLETED" },
      }),
      prisma.penalty.count({
        where: { status: "ACTIVE" },
      }),
    ])

    // Get financial analytics
    const [taxCollected, pendingTax, totalPenaltyAmount] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.taxRecord.aggregate({
        where: {
          status: "PENDING",
          taxYear: Number.parseInt(year),
        },
        _sum: { amount: true },
      }),
      prisma.penalty.aggregate({
        where: { status: "ACTIVE" },
        _sum: { amount: true },
      }),
    ])

    // Get monthly collection data for charts
    const monthlyCollections = await prisma.payment.groupBy({
      by: ["paymentDate"],
      where: {
        status: "COMPLETED",
        paymentDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      _sum: { amount: true },
      _count: { id: true },
    })

    // Process monthly data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const monthData = monthlyCollections.filter((item) => new Date(item.paymentDate).getMonth() + 1 === month)
      return {
        month: new Date(2024, i).toLocaleString("default", { month: "short" }),
        amount: monthData.reduce((sum, item) => sum + (item._sum.amount || 0), 0),
        count: monthData.reduce((sum, item) => sum + item._count.id, 0),
      }
    })

    // Get district-wise analytics
    const districtAnalytics = await prisma.district.findMany({
      include: {
        citizens: {
          include: {
            taxRecords: {
              where: { taxYear: Number.parseInt(year) },
            },
            payments: {
              where: { status: "COMPLETED" },
            },
            penalties: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    })

    const districtData = districtAnalytics.map((district) => {
      const totalTax = district.citizens.reduce(
        (sum, citizen) => sum + citizen.taxRecords.reduce((taxSum, tax) => taxSum + tax.amount, 0),
        0,
      )
      const collectedTax = district.citizens.reduce(
        (sum, citizen) => sum + citizen.payments.reduce((paySum, payment) => paySum + payment.amount, 0),
        0,
      )
      const pendingTax = totalTax - collectedTax
      const penalties = district.citizens.reduce(
        (sum, citizen) => sum + citizen.penalties.reduce((penSum, penalty) => penSum + penalty.amount, 0),
        0,
      )

      return {
        name: district.name,
        citizens: district.citizens.length,
        totalTax,
        collectedTax,
        pendingTax,
        penalties,
        collectionRate: totalTax > 0 ? Math.round((collectedTax / totalTax) * 100) : 0,
      }
    })

    // Get payment method analytics
    const paymentMethods = await prisma.payment.groupBy({
      by: ["method"],
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: { id: true },
    })

    // Get recent activities
    const recentPayments = await prisma.payment.findMany({
      where: { status: "COMPLETED" },
      include: {
        citizen: true,
        taxRecord: true,
      },
      orderBy: { paymentDate: "desc" },
      take: 10,
    })

    const recentPenalties = await prisma.penalty.findMany({
      where: { status: "ACTIVE" },
      include: {
        citizen: true,
        taxRecord: true,
      },
      orderBy: { appliedDate: "desc" },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCitizens,
          totalDistricts,
          totalTaxRecords,
          totalPayments,
          totalPenalties,
          taxCollected: taxCollected._sum.amount || 0,
          pendingTax: pendingTax._sum.amount || 0,
          totalPenaltyAmount: totalPenaltyAmount._sum.amount || 0,
          collectionRate:
            taxCollected._sum.amount && pendingTax._sum.amount
              ? Math.round((taxCollected._sum.amount / (taxCollected._sum.amount + pendingTax._sum.amount)) * 100)
              : 0,
        },
        charts: {
          monthlyCollections: monthlyData,
          districtAnalytics: districtData,
          paymentMethods: paymentMethods.map((method) => ({
            method: method.method,
            amount: method._sum.amount || 0,
            count: method._count.id,
          })),
        },
        recentActivities: {
          payments: recentPayments.map((payment) => ({
            id: payment.id,
            citizenName: payment.citizen.name,
            customerId: payment.citizen.customerId,
            amount: payment.amount,
            method: payment.method,
            date: payment.paymentDate,
            receiptNumber: payment.receiptNumber,
          })),
          penalties: recentPenalties.map((penalty) => ({
            id: penalty.id,
            citizenName: penalty.citizen.name,
            customerId: penalty.citizen.customerId,
            amount: penalty.amount,
            reason: penalty.reason,
            date: penalty.appliedDate,
            daysOverdue: penalty.daysOverdue,
          })),
        },
      },
    })
  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
