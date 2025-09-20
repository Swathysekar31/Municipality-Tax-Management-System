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
    const { citizenIds, message, type } = body

    if (!citizenIds || !Array.isArray(citizenIds) || citizenIds.length === 0) {
      return NextResponse.json({ error: "Citizen IDs are required" }, { status: 400 })
    }

    if (!message || !type) {
      return NextResponse.json({ error: "Message and type are required" }, { status: 400 })
    }

    const smsService = SMSService.getInstance()
    const results = []

    // Send SMS to each citizen
    for (const citizenId of citizenIds) {
      try {
        const citizen = await prisma.citizen.findUnique({
          where: { id: citizenId },
        })

        if (!citizen) {
          results.push({
            citizenId,
            success: false,
            error: "Citizen not found",
          })
          continue
        }

        // Send SMS
        const smsResult = await smsService.sendSMS(citizen.phone, message)

        // Store reminder in database
        await prisma.reminder.create({
          data: {
            citizenId: citizen.id,
            message,
            type,
            status: smsResult.success ? "SENT" : "FAILED",
            sentAt: new Date(),
            messageId: smsResult.messageId,
          },
        })

        results.push({
          citizenId,
          success: smsResult.success,
          messageId: smsResult.messageId,
          error: smsResult.error,
        })
      } catch (error) {
        results.push({
          citizenId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: true,
      message: `SMS sent to ${successCount} citizens, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("SMS send error:", error)
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 })
  }
}
