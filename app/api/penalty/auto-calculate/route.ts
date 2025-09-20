import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PenaltyCalculator } from "@/lib/penalty-calculator"
import { verifyAdminToken } from "@/lib/middleware"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { dryRun = false, citizenIds = [] } = body

    const penaltyCalculator = PenaltyCalculator.getInstance()
    const currentDate = new Date()

    // Get overdue tax records
    const whereClause: any = {
      status: "PENDING",
      dueDate: {
        lt: currentDate,
      },
    }

    // Filter by specific citizens if provided
    if (citizenIds.length > 0) {
      whereClause.citizenId = {
        in: citizenIds,
      }
    }

    const overdueTaxRecords = await prisma.taxRecord.findMany({
      where: whereClause,
      include: {
        citizen: true,
        penalties: {
          where: { status: "ACTIVE" },
        },
      },
    })

    const results = []
    let totalPenaltiesApplied = 0
    let totalPenaltyAmount = 0

    for (const taxRecord of overdueTaxRecords) {
      try {
        // Check if penalty already exists for this tax record
        const existingPenalty = taxRecord.penalties.find((p) => p.taxRecordId === taxRecord.id)

        if (existingPenalty) {
          results.push({
            citizenId: taxRecord.citizenId,
            citizenName: taxRecord.citizen.name,
            taxRecordId: taxRecord.id,
            taxYear: taxRecord.taxYear,
            taxAmount: taxRecord.amount,
            status: "skipped",
            reason: "Penalty already exists",
            existingPenalty: existingPenalty.amount,
          })
          continue
        }

        // Calculate penalty
        const penaltyCalculation = penaltyCalculator.calculatePenalty(taxRecord.amount, taxRecord.dueDate, currentDate)

        if (!penaltyCalculation) {
          results.push({
            citizenId: taxRecord.citizenId,
            citizenName: taxRecord.citizen.name,
            taxRecordId: taxRecord.id,
            taxYear: taxRecord.taxYear,
            taxAmount: taxRecord.amount,
            status: "skipped",
            reason: "Still within grace period",
          })
          continue
        }

        if (!dryRun) {
          // Create penalty record
          await prisma.penalty.create({
            data: {
              citizenId: taxRecord.citizenId,
              taxRecordId: taxRecord.id,
              amount: penaltyCalculation.penaltyAmount,
              reason: `Overdue tax payment - ${penaltyCalculation.appliedRule.name}`,
              status: "ACTIVE",
              appliedDate: currentDate,
              daysOverdue: penaltyCalculation.daysOverdue,
              calculationMethod: penaltyCalculation.calculation,
            },
          })
        }

        results.push({
          citizenId: taxRecord.citizenId,
          citizenName: taxRecord.citizen.name,
          taxRecordId: taxRecord.id,
          taxYear: taxRecord.taxYear,
          taxAmount: taxRecord.amount,
          status: dryRun ? "calculated" : "applied",
          penaltyAmount: penaltyCalculation.penaltyAmount,
          daysOverdue: penaltyCalculation.daysOverdue,
          appliedRule: penaltyCalculation.appliedRule.name,
          calculation: penaltyCalculation.calculation,
        })

        totalPenaltiesApplied++
        totalPenaltyAmount += penaltyCalculation.penaltyAmount
      } catch (error) {
        results.push({
          citizenId: taxRecord.citizenId,
          citizenName: taxRecord.citizen.name,
          taxRecordId: taxRecord.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: dryRun
        ? `Penalty calculation completed (dry run): ${totalPenaltiesApplied} penalties calculated`
        : `Auto-penalty application completed: ${totalPenaltiesApplied} penalties applied`,
      summary: {
        totalRecordsProcessed: overdueTaxRecords.length,
        penaltiesApplied: totalPenaltiesApplied,
        totalPenaltyAmount,
        dryRun,
      },
      results,
    })
  } catch (error) {
    console.error("Auto penalty calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate penalties" }, { status: 500 })
  }
}
