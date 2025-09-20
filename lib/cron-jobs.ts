import cron from "node-cron"
import { prisma } from "./prisma"
import { PenaltyCalculator } from "./penalty-calculator"

async function checkOverdueTaxes() {
  try {
    console.log("🔍 Checking for overdue taxes and applying penalties...")

    const currentDate = new Date()
    const penaltyCalculator = PenaltyCalculator.getInstance()

    // Find unpaid taxes that are past due date
    const overdueTaxes = await prisma.taxRecord.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          lt: currentDate,
        },
      },
      include: {
        citizen: {
          include: {
            district: true,
          },
        },
        penalties: {
          where: { status: "ACTIVE" },
        },
      },
    })

    if (overdueTaxes.length === 0) {
      console.log("✅ No overdue taxes found")
      return
    }

    let penaltiesApplied = 0
    let totalPenaltyAmount = 0

    // Process each overdue tax record
    for (const tax of overdueTaxes) {
      try {
        // Check if penalty already exists for this tax record
        const existingPenalty = tax.penalties.find((p) => p.taxRecordId === tax.id)

        if (!existingPenalty) {
          // Calculate penalty
          const penaltyCalculation = penaltyCalculator.calculatePenalty(tax.amount, tax.dueDate, currentDate)

          if (penaltyCalculation) {
            // Create penalty record
            await prisma.penalty.create({
              data: {
                citizenId: tax.citizenId,
                taxRecordId: tax.id,
                amount: penaltyCalculation.penaltyAmount,
                reason: `Auto-applied: ${penaltyCalculation.appliedRule.name}`,
                status: "ACTIVE",
                appliedDate: currentDate,
                daysOverdue: penaltyCalculation.daysOverdue,
                calculationMethod: penaltyCalculation.calculation,
              },
            })

            penaltiesApplied++
            totalPenaltyAmount += penaltyCalculation.penaltyAmount

            console.log(
              `   💰 Applied penalty: ${tax.citizen.customerId} - ₹${penaltyCalculation.penaltyAmount} (${penaltyCalculation.daysOverdue} days overdue)`,
            )
          }
        }

        // Create automatic reminder
        await prisma.reminder.create({
          data: {
            citizenId: tax.citizenId,
            message: `Dear ${tax.citizen.name}, your tax payment for ${tax.taxYear} is overdue. Amount: ₹${tax.amount}. Please pay immediately to avoid additional penalties. Customer ID: ${tax.citizen.customerId}`,
            type: "OVERDUE",
            status: "SENT",
            sentAt: currentDate,
          },
        })
      } catch (error) {
        console.error(`❌ Error processing tax record ${tax.id}:`, error)
      }
    }

    console.log(`⚠️  Processed ${overdueTaxes.length} overdue taxes`)
    console.log(`💰 Applied ${penaltiesApplied} new penalties totaling ₹${totalPenaltyAmount}`)
  } catch (error) {
    console.error("❌ Error checking overdue taxes:", error)
  }
}

async function sendWeeklyReminders() {
  try {
    console.log("📅 Sending weekly reminders for overdue taxes...")

    const overdueTaxes = await prisma.taxRecord.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        citizen: {
          include: {
            district: true,
          },
        },
        penalties: {
          where: { status: "ACTIVE" },
        },
      },
    })

    if (overdueTaxes.length === 0) {
      console.log("✅ No overdue taxes for weekly reminders")
      return
    }

    // Create weekly reminders
    const reminderPromises = overdueTaxes.map((tax) => {
      const penaltyAmount = tax.penalties.reduce((sum, penalty) => sum + penalty.amount, 0)
      const totalAmount = tax.amount + penaltyAmount

      return prisma.reminder.create({
        data: {
          citizenId: tax.citizenId,
          message: `WEEKLY REMINDER: Dear ${tax.citizen.name}, your tax payment for ${tax.taxYear} remains unpaid. Total amount including penalties: ₹${totalAmount}. Please pay immediately. Customer ID: ${tax.citizen.customerId}`,
          type: "WEEKLY",
          status: "SENT",
          sentAt: new Date(),
        },
      })
    })

    await Promise.all(reminderPromises)

    console.log(`📨 Sent weekly reminders to ${overdueTaxes.length} citizens with overdue taxes`)
  } catch (error) {
    console.error("❌ Error sending weekly reminders:", error)
  }
}

// Schedule cron jobs
export function startCronJobs() {
  // Check for overdue taxes and apply penalties daily at 9:00 AM
  cron.schedule("0 9 * * *", checkOverdueTaxes, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  })

  // Send weekly reminders every Monday at 10:00 AM
  cron.schedule("0 10 * * 1", sendWeeklyReminders, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  })

  console.log("⏰ Cron jobs scheduled:")
  console.log("   - Daily overdue check & penalty application: 9:00 AM IST")
  console.log("   - Weekly reminders: Monday 10:00 AM IST")
}

// Manual functions for testing
export { checkOverdueTaxes, sendWeeklyReminders }
