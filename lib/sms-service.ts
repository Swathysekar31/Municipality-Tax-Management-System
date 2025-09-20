// Mock SMS service for Twilio integration
export interface SMSMessage {
  to: string
  message: string
  type: "reminder" | "overdue" | "penalty"
}

export interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Mock Twilio service - replace with actual Twilio in production
export class SMSService {
  private static instance: SMSService
  private apiKey: string
  private fromNumber: string

  constructor() {
    this.apiKey = process.env.TWILIO_API_KEY || "mock_api_key"
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || "+1234567890"
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService()
    }
    return SMSService.instance
  }

  async sendSMS(to: string, message: string): Promise<SMSResponse> {
    try {
      // Mock SMS sending - replace with actual Twilio API call
      console.log(`[SMS] Sending to ${to}: ${message}`)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock success response (90% success rate)
      const success = Math.random() > 0.1

      if (success) {
        return {
          success: true,
          messageId: `mock_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }
      } else {
        return {
          success: false,
          error: "Failed to deliver SMS",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  generateReminderMessage(citizenName: string, taxAmount: number, dueDate: string): string {
    return `Dear ${citizenName}, your tax payment of ₹${taxAmount} is due on ${dueDate}. Please pay to avoid penalties. - Municipality`
  }

  generateOverdueMessage(citizenName: string, taxAmount: number, penaltyAmount: number): string {
    return `Dear ${citizenName}, your tax payment of ₹${taxAmount} is overdue. Penalty of ₹${penaltyAmount} has been added. Total: ₹${taxAmount + penaltyAmount}. - Municipality`
  }

  generatePenaltyMessage(citizenName: string, penaltyAmount: number): string {
    return `Dear ${citizenName}, a penalty of ₹${penaltyAmount} has been added to your account for late payment. Please clear your dues immediately. - Municipality`
  }
}
