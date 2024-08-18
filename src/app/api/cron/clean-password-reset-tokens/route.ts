import env from "@/lib/env.server"
import { cleanExpiredPasswordResetTokens } from "@/server/data"
import { verifySignatureEdge } from "@upstash/qstash/nextjs"
import { StatusCodes } from "http-status-codes"
import { NextResponse } from "next/server"

async function handler() {
  const rows = await cleanExpiredPasswordResetTokens()

  return NextResponse.json({ success: true, rows }, { status: StatusCodes.OK })
}

export const POST = env.MOCK_QSTASH ? handler : verifySignatureEdge(handler)

export const runtime = "edge"
