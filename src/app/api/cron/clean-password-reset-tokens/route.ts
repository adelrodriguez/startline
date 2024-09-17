import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { StatusCodes } from "http-status-codes"
import { NextResponse } from "next/server"
import env from "~/lib/env.server"
import { cleanExpiredPasswordResetTokens } from "~/server/data/user"

async function handler() {
  const rows = await cleanExpiredPasswordResetTokens()

  return NextResponse.json({ success: true, rows }, { status: StatusCodes.OK })
}

export const POST = env.MOCK_QSTASH
  ? handler
  : verifySignatureAppRouter(handler)
