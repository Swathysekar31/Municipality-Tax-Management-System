import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth, generateCustomerId } from "@/lib/middleware"

// GET /api/citizen - Get all citizens
export const GET = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { searchParams } = new URL(req.url)
    const district_id = searchParams.get("district_id")
    const search = searchParams.get("search")

    const where: any = {}

    if (district_id) {
      where.district_id = Number.parseInt(district_id)
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { customer_id: { contains: search, mode: "insensitive" } },
        { contact_no: { contains: search } },
      ]
    }

    const citizens = await prisma.citizen.findMany({
      where,
      include: {
        district: true,
        _count: {
          select: {
            taxRecords: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: citizens.map((citizen) => ({
        citizen_id: citizen.citizen_id,
        customer_id: citizen.customer_id,
        name: citizen.name,
        ward_no: citizen.ward_no,
        district: citizen.district.district_name,
        city: citizen.city,
        state: citizen.state,
        contact_no: citizen.contact_no,
        tax_records_count: citizen._count.taxRecords,
        payments_count: citizen._count.payments,
        createdAt: citizen.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get citizens error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")

// POST /api/citizen - Add new citizen
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { name, ward_no, district_id, city, state, contact_no } = await req.json()

    if (!name || !ward_no || !district_id || !city || !state || !contact_no) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Verify district exists
    const district = await prisma.district.findUnique({
      where: { district_id: Number.parseInt(district_id) },
    })

    if (!district) {
      return NextResponse.json({ error: "District not found" }, { status: 404 })
    }

    // Generate unique customer ID
    let customer_id: string
    let isUnique = false

    do {
      customer_id = generateCustomerId()
      const existing = await prisma.citizen.findUnique({
        where: { customer_id },
      })
      isUnique = !existing
    } while (!isUnique)

    const citizen = await prisma.citizen.create({
      data: {
        customer_id,
        name,
        ward_no,
        district_id: Number.parseInt(district_id),
        city,
        state,
        contact_no,
      },
      include: {
        district: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Citizen registered successfully",
      data: {
        citizen_id: citizen.citizen_id,
        customer_id: citizen.customer_id,
        name: citizen.name,
        ward_no: citizen.ward_no,
        district: citizen.district.district_name,
        city: citizen.city,
        state: citizen.state,
        contact_no: citizen.contact_no,
        createdAt: citizen.createdAt,
      },
    })
  } catch (error) {
    console.error("Create citizen error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")
