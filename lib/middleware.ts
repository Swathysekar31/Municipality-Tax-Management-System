import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(handler: Function, requiredType?: "admin" | "citizen") {
  return async (req: NextRequest, context?: any) => {
    try {
      const authHeader = req.headers.get("authorization")

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 })
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)

      if (!payload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      if (requiredType && payload.type !== requiredType) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      // Add user info to request
      const requestWithUser = req as NextRequest & { user: typeof payload }
      requestWithUser.user = payload

      return handler(requestWithUser, context)
    } catch (error) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

export async function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "No token provided" }
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return { success: false, error: "Invalid token" }
    }

    if (payload.type !== "admin") {
      return { success: false, error: "Admin access required" }
    }

    return {
      success: true,
      adminId: payload.id,
      payload,
    }
  } catch (error) {
    return { success: false, error: "Authentication failed" }
  }
}

export async function verifyCitizenToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "No token provided" }
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return { success: false, error: "Invalid token" }
    }

    if (payload.type !== "citizen") {
      return { success: false, error: "Citizen access required" }
    }

    return {
      success: true,
      citizenId: payload.id,
      payload,
    }
  } catch (error) {
    return { success: false, error: "Authentication failed" }
  }
}

// Re-export auth functions for convenience
export { generateCustomerId, generateReceiptNumber } from "./auth"
