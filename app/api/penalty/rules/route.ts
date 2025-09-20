import { type NextRequest, NextResponse } from "next/server"
import { PenaltyCalculator } from "@/lib/penalty-calculator"
import { verifyAdminToken } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const penaltyCalculator = PenaltyCalculator.getInstance()
    const rules = penaltyCalculator.getPenaltyRules()

    return NextResponse.json({
      success: true,
      rules,
    })
  } catch (error) {
    console.error("Get penalty rules error:", error)
    return NextResponse.json({ error: "Failed to get penalty rules" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { rules } = body

    if (!rules || !Array.isArray(rules)) {
      return NextResponse.json({ error: "Valid rules array is required" }, { status: 400 })
    }

    // Validate rules structure
    for (const rule of rules) {
      if (
        !rule.id ||
        !rule.name ||
        !rule.type ||
        typeof rule.value !== "number" ||
        typeof rule.gracePeriodDays !== "number"
      ) {
        return NextResponse.json({ error: "Invalid rule structure" }, { status: 400 })
      }

      if (!["FIXED", "PERCENTAGE"].includes(rule.type)) {
        return NextResponse.json({ error: "Rule type must be FIXED or PERCENTAGE" }, { status: 400 })
      }
    }

    const penaltyCalculator = PenaltyCalculator.getInstance()
    penaltyCalculator.updatePenaltyRules(rules)

    return NextResponse.json({
      success: true,
      message: "Penalty rules updated successfully",
      rules,
    })
  } catch (error) {
    console.error("Update penalty rules error:", error)
    return NextResponse.json({ error: "Failed to update penalty rules" }, { status: 500 })
  }
}
