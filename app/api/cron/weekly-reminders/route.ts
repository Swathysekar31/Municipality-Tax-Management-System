import { type NextRequest, NextResponse } from "next/server"
import { sendWeeklyReminders } from "@/lib/cron-jobs"
import { withAuth } from "@/lib/middleware"

// POST /api/cron/weekly-reminders - Manually trigger weekly reminders
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    await sendWeeklyReminders()

    return NextResponse.json({
      success: true,
      message: "Weekly reminders sent successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Manual weekly reminders error:", error)
    return NextResponse.json({ error: "Failed to send weekly reminders" }, { status: 500 })
  }
}, "admin")
