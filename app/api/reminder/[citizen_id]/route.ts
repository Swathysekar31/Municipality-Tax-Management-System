import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/reminder/[citizen_id] - Get reminders of citizen
export const GET = withAuth(
  async (req: NextRequest & { user: any }, { params }: { params: { citizen_id: string } }) => {
    try {
      const citizen_id = Number.parseInt(params.citizen_id)

      if (isNaN(citizen_id)) {
        return NextResponse.json({ error: "Invalid citizen ID" }, { status: 400 })
      }

      // Verify citizen access (citizens can only access their own reminders)
      if (req.user.type === "citizen" && req.user.id !== citizen_id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      const reminders = await prisma.reminder.findMany({
        where: { citizen_id },
        include: {
          citizen: {
            include: {
              district: true,
            },
          },
        },
        orderBy: { reminder_date: "desc" },
      })

      if (reminders.length === 0) {
        return NextResponse.json({ error: "No reminders found" }, { status: 404 })
      }

      // Calculate summary
      const totalReminders = reminders.length
      const sentReminders = reminders.filter((reminder) => reminder.message_status === "sent").length
      const failedReminders = reminders.filter((reminder) => reminder.message_status === "failed").length

      return NextResponse.json({
        success: true,
        data: {
          citizen_info: {
            customer_id: reminders[0].citizen.customer_id,
            name: reminders[0].citizen.name,
            district: reminders[0].citizen.district.district_name,
          },
          reminder_summary: {
            total_reminders: totalReminders,
            sent_reminders: sentReminders,
            failed_reminders: failedReminders,
          },
          reminders: reminders.map((reminder) => ({
            reminder_id: reminder.reminder_id,
            message: reminder.message,
            reminder_date: reminder.reminder_date,
            message_status: reminder.message_status,
          })),
        },
      })
    } catch (error) {
      console.error("Get citizen reminders error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  },
)
