import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// POST /api/tax - Add new tax record for citizen
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { citizen_id, tax_year, amount, due_date } = await req.json()

    if (!citizen_id || !tax_year || !amount || !due_date) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Verify citizen exists
    const citizen = await prisma.citizen.findUnique({
      where: { citizen_id: Number.parseInt(citizen_id) },
    })

    if (!citizen) {
      return NextResponse.json({ error: "Citizen not found" }, { status: 404 })
    }

    // Check if tax record already exists for this year
    const existingTax = await prisma.taxRecord.findFirst({
      where: {
        citizen_id: Number.parseInt(citizen_id),
        tax_year,
      },
    })

    if (existingTax) {
      return NextResponse.json({ error: "Tax record already exists for this year" }, { status: 409 })
    }

    const taxRecord = await prisma.taxRecord.create({
      data: {
        citizen_id: Number.parseInt(citizen_id),
        tax_year,
        amount: Number.parseFloat(amount),
        due_date: new Date(due_date),
        status: "unpaid",
      },
      include: {
        citizen: {
          include: {
            district: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Tax record created successfully",
      data: {
        tax_id: taxRecord.tax_id,
        citizen: {
          customer_id: taxRecord.citizen.customer_id,
          name: taxRecord.citizen.name,
          district: taxRecord.citizen.district.district_name,
        },
        tax_year: taxRecord.tax_year,
        amount: taxRecord.amount,
        due_date: taxRecord.due_date,
        status: taxRecord.status,
        createdAt: taxRecord.createdAt,
      },
    })
  } catch (error) {
    console.error("Create tax record error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")
