import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { customer_id } = await req.json()

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Find citizen by customer_id
    const citizen = await prisma.citizen.findUnique({
      where: { customer_id },
      include: {
        district: true,
      },
    })

    if (!citizen) {
      return NextResponse.json({ error: "Invalid Customer ID" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      id: citizen.citizen_id,
      type: "citizen",
      customer_id: citizen.customer_id,
    })

    return NextResponse.json({
      success: true,
      message: "Citizen login successful",
      data: {
        token,
        citizen: {
          citizen_id: citizen.citizen_id,
          customer_id: citizen.customer_id,
          name: citizen.name,
          ward_no: citizen.ward_no,
          district: citizen.district.district_name,
          city: citizen.city,
          state: citizen.state,
          contact_no: citizen.contact_no,
        },
      },
    })
  } catch (error) {
    console.error("Citizen login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
