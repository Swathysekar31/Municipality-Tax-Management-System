import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SMSService } from "@/lib/sms-service"
import { verifyAdminToken } from "@/lib/middleware"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { reminderType, customMessage } = body

    if (!reminderType || !["upcoming", "overdue", "penalty"].includes(reminderType)) {
      return NextResponse.json({ error: "Valid reminder type is required" }, { status: 400 })
    }

    const smsService = SMSService.getInstance()
    let citizens = []

    // Get citizens based on reminder type
    if (reminderType === "upcoming") {
      // Citizens with tax due in next 7 days
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

      citizens = await prisma.citizen.findMany({
        include: {
          taxRecords: {
            where: {
              status: "PENDING",
              dueDate: {
                lte: sevenDaysFromNow,
                gte: new Date(),
              },
            },
          },
        },
      })
    } else if (reminderType === "overdue") {
      // Citizens with overdue tax
      citizens = await prisma.citizen.findMany({
        include: {
          taxRecords: {
            where: {
              status: "PENDING",
              dueDate: {
                lt: new Date(),
              },
            },
          },
        },
      })
    } else if (reminderType === "penalty") {
      // Citizens with penalties
      citizens = await prisma.citizen.findMany({
        include: {
          penalties: {
            where: {
              status: "ACTIVE",
            },
          },
          taxRecords: {
            where: {
              status: "PENDING",
            },
          },
        },
      })
    }

    // Filter citizens who actually have relevant records
    const eligibleCitizens = citizens.filter((citizen) => {
      if (reminderType === "penalty") {
        return citizen.penalties.length > 0
      }
      return citizen.taxRecords.length > 0
    })

    if (eligibleCitizens.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No eligible citizens found for this reminder type",
        results: [],
        summary: { total: 0, successful: 0, failed: 0 },
      })
    }

    const results = []

    // Send SMS to each eligible citizen
    for (const citizen of eligibleCitizens) {
      try {
        let message = customMessage

        // Generate default message if not provided
        if (!customMessage) {
          if (reminderType === "upcoming") {
            const taxRecord = citizen.taxRecords[0]
            message = smsService.generateReminderMessage(
              citizen.name,
              taxRecord.amount,
              taxRecord.dueDate.toLocaleDateString(),
            )
          } else if (reminderType === "overdue") {
            const taxRecord = citizen.taxRecords[0]
            const penalty = await prisma.penalty.findFirst({
              where: { citizenId: citizen.id, status: "ACTIVE" },
            })
            message = smsService.generateOverdueMessage(citizen.name, taxRecord.amount, penalty?.amount || 0)
          } else if (reminderType === "penalty") {
            const totalPenalty = citizen.penalties.reduce((sum, p) => sum + p.amount, 0)
            message = smsService.generatePenaltyMessage(citizen.name, totalPenalty)
          }
        }

        // Send SMS
        const smsResult = await smsService.sendSMS(citizen.phone, message)

        // Store reminder in database
        await prisma.reminder.create({
          data: {
            citizenId: citizen.id,
            message,
            type: reminderType.toUpperCase(),
            status: smsResult.success ? "SENT" : "FAILED",
            sentAt: new Date(),
            messageId: smsResult.messageId,
          },
        })

        results.push({
          citizenId: citizen.id,
          citizenName: citizen.name,
          success: smsResult.success,
          messageId: smsResult.messageId,
          error: smsResult.error,
        })
      } catch (error) {
        results.push({
          citizenId: citizen.id,
          citizenName: citizen.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: true,
      message: `Bulk ${reminderType} reminders sent to ${successCount} citizens, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("Bulk SMS reminder error:", error)
    return NextResponse.json({ error: "Failed to send bulk reminders" }, { status: 500 })
  }
}
