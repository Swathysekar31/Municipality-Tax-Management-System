// Mock Payment Gateway service for Stripe/Razorpay integration
export interface PaymentRequest {
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerName: string
  customerPhone: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  paymentId?: string
  transactionId?: string
  status?: "pending" | "completed" | "failed"
  error?: string
  gatewayResponse?: any
}

export interface PaymentSession {
  sessionId: string
  paymentUrl: string
  expiresAt: Date
}

// Mock Payment Gateway - replace with actual Stripe/Razorpay in production
export class PaymentGateway {
  private static instance: PaymentGateway
  private apiKey: string
  private webhookSecret: string

  constructor() {
    this.apiKey = process.env.PAYMENT_GATEWAY_API_KEY || "mock_api_key"
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "mock_webhook_secret"
  }

  static getInstance(): PaymentGateway {
    if (!PaymentGateway.instance) {
      PaymentGateway.instance = new PaymentGateway()
    }
    return PaymentGateway.instance
  }

  async createPaymentSession(request: PaymentRequest): Promise<PaymentSession> {
    try {
      // Mock payment session creation
      console.log(`[Payment] Creating session for ₹${request.amount}`)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const paymentUrl = `https://mock-gateway.com/pay/${sessionId}`
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 30) // 30 minutes expiry

      return {
        sessionId,
        paymentUrl,
        expiresAt,
      }
    } catch (error) {
      throw new Error(`Failed to create payment session: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log(`[Payment] Processing payment for ₹${request.amount}`)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock payment processing (90% success rate)
      const success = Math.random() > 0.1

      if (success) {
        const paymentId = `mock_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const transactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        return {
          success: true,
          paymentId,
          transactionId,
          status: "completed",
          gatewayResponse: {
            amount: request.amount,
            currency: request.currency,
            method: "card",
            timestamp: new Date().toISOString(),
          },
        }
      } else {
        return {
          success: false,
          status: "failed",
          error: "Payment declined by bank",
        }
      }
    } catch (error) {
      return {
        success: false,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      console.log(`[Payment] Verifying payment ${paymentId}`)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock verification (95% success rate for existing payments)
      const success = Math.random() > 0.05

      if (success) {
        return {
          success: true,
          paymentId,
          status: "completed",
          gatewayResponse: {
            verified: true,
            timestamp: new Date().toISOString(),
          },
        }
      } else {
        return {
          success: false,
          status: "failed",
          error: "Payment verification failed",
        }
      }
    } catch (error) {
      return {
        success: false,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  generateReceiptNumber(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `RCP${timestamp}${random}`
  }
}
