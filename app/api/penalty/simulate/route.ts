import { type NextRequest, NextResponse } from "next/server"
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
    const { taxAmount, dueDate, currentDate } = body

    if (!taxAmount || !dueDate) {
      return NextResponse.json({ error: "Tax amount and due date are required" }, { status: 400 })
    }

    const penaltyCalculator = PenaltyCalculator.getInstance()
    const dueDateObj = new Date(dueDate)
    const currentDateObj = currentDate ? new Date(currentDate) : new Date()

    const penaltyCalculation = penaltyCalculator.calculatePenalty(taxAmount, dueDateObj, currentDateObj)

    if (!penaltyCalculation) {
      return NextResponse.json({
        success: true,
        message: "No penalty applicable - not overdue or within grace period",
        penalty: null,
        daysOverdue: Math.floor((currentDateObj.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24)),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Penalty calculation completed",
      penalty: {
        amount: penaltyCalculation.penaltyAmount,
        daysOverdue: penaltyCalculation.daysOverdue,
        appliedRule: penaltyCalculation.appliedRule,
        calculation: penaltyCalculation.calculation,
      },
      input: {
        taxAmount,
        dueDate: dueDateObj.toISOString(),
        currentDate: currentDateObj.toISOString(),
      },
    })
  } catch (error) {
    console.error("Penalty simulation error:", error)
    return NextResponse.json({ error: "Failed to simulate penalty" }, { status: 500 })
  }
}
