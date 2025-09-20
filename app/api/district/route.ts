import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

// GET /api/district - Get all districts
export const GET = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const districts = await prisma.district.findMany({
      include: {
        _count: {
          select: { citizens: true },
        },
      },
      orderBy: { district_name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: districts.map((district) => ({
        district_id: district.district_id,
        district_name: district.district_name,
        citizen_count: district._count.citizens,
        createdAt: district.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get districts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")

// POST /api/district - Add new district
export const POST = withAuth(async (req: NextRequest & { user: any }) => {
  try {
    const { district_name } = await req.json()

    if (!district_name) {
      return NextResponse.json({ error: "District name is required" }, { status: 400 })
    }

    // Check if district already exists
    const existingDistrict = await prisma.district.findUnique({
      where: { district_name },
    })

    if (existingDistrict) {
      return NextResponse.json({ error: "District already exists" }, { status: 409 })
    }

    const district = await prisma.district.create({
      data: { district_name },
    })

    return NextResponse.json({
      success: true,
      message: "District created successfully",
      data: {
        district_id: district.district_id,
        district_name: district.district_name,
        createdAt: district.createdAt,
      },
    })
  } catch (error) {
    console.error("Create district error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}, "admin")
