import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Verify user still exists in database
    if (payload.type === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { admin_id: payload.id },
      })

      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          type: "admin",
          user: {
            admin_id: admin.admin_id,
            username: admin.username,
          },
        },
      })
    } else if (payload.type === "citizen") {
      const citizen = await prisma.citizen.findUnique({
        where: { citizen_id: payload.id },
        include: {
          district: true,
        },
      })

      if (!citizen) {
        return NextResponse.json({ error: "Citizen not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: {
          type: "citizen",
          user: {
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
    }

    return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
