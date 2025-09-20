import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Webhook endpoint for payment gateway notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get("x-webhook-signature")

    // Verify webhook signature (mock verification)
    if (!signature || signature !== "mock_webhook_signature") {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const { event, data } = body

    switch (event) {
      case "payment.completed":
        await handlePaymentCompleted(data)
        break
      case "payment.failed":
        await handlePaymentFailed(data)
        break
      case "payment.expired":
        await handlePaymentExpired(data)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ success: true, message: "Webhook processed" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

async function handlePaymentCompleted(data: any) {
  const { sessionId, paymentId, transactionId, amount } = data

  const payment = await prisma.payment.findFirst({
    where: { gatewaySessionId: sessionId },
    include: {
      taxRecord: {
        include: {
          penalties: { where: { status: "ACTIVE" } },
        },
      },
    },
  })

  if (payment && payment.status === "PENDING") {
    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        gatewayPaymentId: paymentId,
        gatewayTransactionId: transactionId,
        gatewayResponse: data,
      },
    })

    // Update tax record
    await prisma.taxRecord.update({
      where: { id: payment.taxRecordId },
      data: {
        status: "PAID",
        paidDate: new Date(),
      },
    })

    // Mark penalties as paid
    if (payment.taxRecord.penalties.length > 0) {
      await prisma.penalty.updateMany({
        where: {
          citizenId: payment.citizenId,
          status: "ACTIVE",
        },
        data: {
          status: "PAID",
          paidDate: new Date(),
        },
      })
    }

    console.log(`Payment completed for session ${sessionId}`)
  }
}

async function handlePaymentFailed(data: any) {
  const { sessionId, error } = data

  const payment = await prisma.payment.findFirst({
    where: { gatewaySessionId: sessionId },
  })

  if (payment && payment.status === "PENDING") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        gatewayResponse: { error, ...data },
      },
    })

    console.log(`Payment failed for session ${sessionId}: ${error}`)
  }
}

async function handlePaymentExpired(data: any) {
  const { sessionId } = data

  const payment = await prisma.payment.findFirst({
    where: { gatewaySessionId: sessionId },
  })

  if (payment && payment.status === "PENDING") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "EXPIRED",
        gatewayResponse: data,
      },
    })

    console.log(`Payment expired for session ${sessionId}`)
  }
}
