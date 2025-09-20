import { type NextRequest, NextResponse } from "next/server"
import { checkOverdueTaxes } from "@/lib/cron-jobs"
import { withAuth } from "@/lib/middleware"

// POST /api/cron/check-overdue - Manually trigger overdue tax check
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    await checkOverdueTaxes()

    return NextResponse.json({
      success: true,
      message: "Overdue tax check completed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Manual overdue check error:", error)
    return NextResponse.json({ error: "Failed to check overdue taxes" }, { status: 500 })
  }
}, "admin")
