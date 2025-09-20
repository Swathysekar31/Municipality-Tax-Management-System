import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// POST /api/reminder - Send reminder (store record in DB)
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { citizen_ids, message } = await req.json()

    if (!citizen_ids || !Array.isArray(citizen_ids) || citizen_ids.length === 0) {
      return NextResponse.json({ error: "Citizen IDs array is required" }, { status: 400 })
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Verify all citizens exist
    const citizens = await prisma.citizen.findMany({
      where: {
        citizen_id: {
          in: citizen_ids.map((id: string) => Number.parseInt(id)),
        },
      },
      include: {
        district: true,
      },
    })

    if (citizens.length !== citizen_ids.length) {
      return NextResponse.json({ error: "Some citizens not found" }, { status: 404 })
    }

    // Create reminder records for all citizens
    const reminders = await Promise.all(
      citizens.map((citizen) =>
        prisma.reminder.create({
          data: {
            citizen_id: citizen.citizen_id,
            message,
            message_status: "sent", // In real implementation, this would be updated based on SMS API response
          },
        }),
      ),
    )

    // In a real implementation, you would integrate with SMS API here
    // For now, we'll simulate SMS sending
    const smsResults = citizens.map((citizen) => ({
      citizen_id: citizen.citizen_id,
      customer_id: citizen.customer_id,
      name: citizen.name,
      contact_no: citizen.contact_no,
      status: "sent", // Simulated success
    }))

    return NextResponse.json({
      success: true,
      message: `Reminders sent to ${citizens.length} citizens`,
      data: {
        total_sent: citizens.length,
        reminders: reminders.map((reminder, index) => ({
          reminder_id: reminder.reminder_id,
          citizen: {
            customer_id: citizens[index].customer_id,
            name: citizens[index].name,
            contact_no: citizens[index].contact_no,
          },
          message: reminder.message,
          reminder_date: reminder.reminder_date,
          message_status: reminder.message_status,
        })),
        sms_results: smsResults,
      },
    })
  } catch (error) {
    console.error("Send reminder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")
