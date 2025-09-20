// Enhanced penalty calculation system
export interface PenaltyRule {
  id: string
  name: string
  type: "FIXED" | "PERCENTAGE"
  value: number
  gracePeriodDays: number
  maxPenalty?: number
  description: string
}

export interface PenaltyCalculation {
  penaltyAmount: number
  daysOverdue: number
  appliedRule: PenaltyRule
  calculation: string
}

export class PenaltyCalculator {
  private static instance: PenaltyCalculator
  private penaltyRules: PenaltyRule[]

  constructor() {
    // Default penalty rules - can be made configurable via database
    this.penaltyRules = [
      {
        id: "fixed_100",
        name: "Fixed Penalty",
        type: "FIXED",
        value: 100,
        gracePeriodDays: 7,
        description: "Fixed penalty of ₹100 after 7 days grace period",
      },
      {
        id: "percentage_2",
        name: "Percentage Penalty",
        type: "PERCENTAGE",
        value: 2,
        gracePeriodDays: 15,
        maxPenalty: 1000,
        description: "2% of tax amount after 15 days, max ₹1000",
      },
      {
        id: "escalating",
        name: "Escalating Penalty",
        type: "FIXED",
        value: 50,
        gracePeriodDays: 30,
        description: "₹50 per month after 30 days",
      },
    ]
  }

  static getInstance(): PenaltyCalculator {
    if (!PenaltyCalculator.instance) {
      PenaltyCalculator.instance = new PenaltyCalculator()
    }
    return PenaltyCalculator.instance
  }

  calculatePenalty(taxAmount: number, dueDate: Date, currentDate: Date = new Date()): PenaltyCalculation | null {
    const daysOverdue = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysOverdue <= 0) {
      return null // Not overdue
    }

    // Use the first applicable rule (can be enhanced to use multiple rules)
    const applicableRule = this.penaltyRules.find((rule) => daysOverdue > rule.gracePeriodDays)

    if (!applicableRule) {
      return null // Still within grace period
    }

    let penaltyAmount = 0
    let calculation = ""

    switch (applicableRule.type) {
      case "FIXED":
        if (applicableRule.id === "escalating") {
          // Escalating penalty: ₹50 per month
          const monthsOverdue = Math.ceil((daysOverdue - applicableRule.gracePeriodDays) / 30)
          penaltyAmount = applicableRule.value * monthsOverdue
          calculation = `₹${applicableRule.value} × ${monthsOverdue} months = ₹${penaltyAmount}`
        } else {
          penaltyAmount = applicableRule.value
          calculation = `Fixed penalty: ₹${penaltyAmount}`
        }
        break

      case "PERCENTAGE":
        penaltyAmount = (taxAmount * applicableRule.value) / 100
        if (applicableRule.maxPenalty && penaltyAmount > applicableRule.maxPenalty) {
          penaltyAmount = applicableRule.maxPenalty
          calculation = `${applicableRule.value}% of ₹${taxAmount} = ₹${(taxAmount * applicableRule.value) / 100}, capped at ₹${applicableRule.maxPenalty}`
        } else {
          calculation = `${applicableRule.value}% of ₹${taxAmount} = ₹${penaltyAmount}`
        }
        break
    }

    return {
      penaltyAmount: Math.round(penaltyAmount),
      daysOverdue,
      appliedRule: applicableRule,
      calculation,
    }
  }

  getPenaltyRules(): PenaltyRule[] {
    return this.penaltyRules
  }

  updatePenaltyRules(rules: PenaltyRule[]): void {
    this.penaltyRules = rules
  }
}
