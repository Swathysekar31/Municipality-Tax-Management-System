import { NextResponse } from "next/server"
import { swaggerConfig } from "@/lib/swagger-config"

export async function GET() {
  return NextResponse.json(swaggerConfig)
}
