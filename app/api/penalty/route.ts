import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// POST /api/penalty - Add penalty for overdue tax
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { tax_ids, penalty_percentage } = await req.json()

    if (!tax_ids || !Array.isArray(tax_ids) || tax_ids.length === 0) {
      return NextResponse.json({ error: "Tax IDs array is required" }, { status: 400 })
    }

    if (!penalty_percentage || penalty_percentage <= 0) {
      return NextResponse.json({ error: "Valid penalty percentage is required" }, { status: 400 })
    }

    // Get tax records with citizen info
    const taxRecords = await prisma.taxRecord.findMany({
      where: {
        tax_id: {
          in: tax_ids.map((id: string) => Number.parseInt(id)),
        },
        status: {
          in: ["unpaid", "overdue"],
        },
      },
      include: {
        citizen: {
          include: {
            district: true,
          },
        },
        penalties: {
          where: { status: "active" },
        },
      },
    })

    if (taxRecords.length === 0) {
      return NextResponse.json({ error: "No eligible tax records found" }, { status: 404 })
    }

    // Create penalties for each tax record
    const penalties = await Promise.all(
      taxRecords.map(async (taxRecord) => {
        // Check if penalty already exists for this tax record
        const existingPenalty = taxRecord.penalties.find((p) => p.status === "active")
        if (existingPenalty) {
          return null // Skip if penalty already exists
        }

        const penaltyAmount = (taxRecord.amount * penalty_percentage) / 100

        const penalty = await prisma.penalty.create({
          data: {
            citizen_id: taxRecord.citizen_id,
            tax_id: taxRecord.tax_id,
            penalty_amount: penaltyAmount,
            status: "active",
          },
        })

        // Update tax record status to overdue
        await prisma.taxRecord.update({
          where: { tax_id: taxRecord.tax_id },
          data: { status: "overdue" },
        })

        return {
          penalty,
          taxRecord,
        }
      }),
    )

    const validPenalties = penalties.filter((p) => p !== null)

    return NextResponse.json({
      success: true,
      message: `Penalties added for ${validPenalties.length} tax records`,
      data: {
        total_penalties: validPenalties.length,
        penalty_percentage,
        penalties: validPenalties.map(({ penalty, taxRecord }) => ({
          penalty_id: penalty!.penalty_id,
          citizen: {
            customer_id: taxRecord!.citizen.customer_id,
            name: taxRecord!.citizen.name,
            district: taxRecord!.citizen.district.district_name,
          },
          tax_year: taxRecord!.tax_year,
          tax_amount: taxRecord!.amount,
          penalty_amount: penalty!.penalty_amount,
          penalty_date: penalty!.penalty_date,
          status: penalty!.status,
        })),
      },
    })
  } catch (error) {
    console.error("Add penalty error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")
