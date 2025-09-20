import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PaymentGateway } from "@/lib/payment-gateway"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, sessionId } = body

    if (!paymentId && !sessionId) {
      return NextResponse.json({ error: "Payment ID or Session ID is required" }, { status: 400 })
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: sessionId ? { gatewaySessionId: sessionId } : { id: paymentId },
      include: {
        taxRecord: {
          include: {
            penalties: {
              where: { status: "ACTIVE" },
            },
          },
        },
        citizen: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        payment: {
          id: payment.id,
          status: payment.status,
          receiptNumber: payment.receiptNumber,
          amount: payment.amount,
        },
      })
    }

    const paymentGateway = PaymentGateway.getInstance()

    // Verify payment with gateway
    const verificationResult = await paymentGateway.verifyPayment(payment.gatewayPaymentId || sessionId || paymentId)

    if (verificationResult.success && verificationResult.status === "completed") {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          gatewayPaymentId: verificationResult.paymentId,
          gatewayTransactionId: verificationResult.transactionId,
          gatewayResponse: verificationResult.gatewayResponse,
        },
      })

      // Update tax record status
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

      return NextResponse.json({
        success: true,
        message: "Payment verified and completed successfully",
        payment: {
          id: payment.id,
          status: "COMPLETED",
          receiptNumber: payment.receiptNumber,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          citizen: {
            name: payment.citizen.name,
            customerId: payment.citizen.customerId,
          },
          taxRecord: {
            taxYear: payment.taxRecord.taxYear,
            amount: payment.taxRecord.amount,
          },
        },
      })
    } else {
      // Update payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          gatewayResponse: verificationResult.gatewayResponse,
        },
      })

      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
          error: verificationResult.error,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
