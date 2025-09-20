import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/penalty/[citizen_id] - Get penalties
export const GET = withAuth(
  async (req: NextRequest & { user: any }, { params }: { params: { citizen_id: string } }) => {
    try {
      const citizen_id = Number.parseInt(params.citizen_id)

      if (isNaN(citizen_id)) {
        return NextResponse.json({ error: "Invalid citizen ID" }, { status: 400 })
      }

      // Verify citizen access (citizens can only access their own penalties)
      if (req.user.type === "citizen" && req.user.id !== citizen_id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      const penalties = await prisma.penalty.findMany({
        where: { citizen_id },
        include: {
          citizen: {
            include: {
              district: true,
            },
          },
          taxRecord: true,
        },
        orderBy: { penalty_date: "desc" },
      })

      if (penalties.length === 0) {
        return NextResponse.json({ error: "No penalties found" }, { status: 404 })
      }

      // Calculate summary
      const totalPenalties = penalties.length
      const activePenalties = penalties.filter((penalty) => penalty.status === "active").length
      const paidPenalties = penalties.filter((penalty) => penalty.status === "paid").length
      const waivedPenalties = penalties.filter((penalty) => penalty.status === "waived").length
      const totalPenaltyAmount = penalties
        .filter((penalty) => penalty.status === "active")
        .reduce((sum, penalty) => sum + penalty.penalty_amount, 0)

      return NextResponse.json({
        success: true,
        data: {
          citizen_info: {
            customer_id: penalties[0].citizen.customer_id,
            name: penalties[0].citizen.name,
            district: penalties[0].citizen.district.district_name,
          },
          penalty_summary: {
            total_penalties: totalPenalties,
            active_penalties: activePenalties,
            paid_penalties: paidPenalties,
            waived_penalties: waivedPenalties,
            total_penalty_amount: totalPenaltyAmount,
          },
          penalties: penalties.map((penalty) => ({
            penalty_id: penalty.penalty_id,
            tax_year: penalty.taxRecord.tax_year,
            tax_amount: penalty.taxRecord.amount,
            penalty_amount: penalty.penalty_amount,
            penalty_date: penalty.penalty_date,
            status: penalty.status,
            tax_status: penalty.taxRecord.status,
          })),
        },
      })
    } catch (error) {
      console.error("Get citizen penalties error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  },
)
