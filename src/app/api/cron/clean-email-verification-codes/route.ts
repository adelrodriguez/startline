import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { StatusCodes } from "http-status-codes"
import { NextResponse } from "next/server"
import env from "~/lib/env.server"
import { deleteExpiredEmailVerificationCodes } from "~/server/data/user"

// TODO(adelrodriguez): Merge with other clean jobs into a workflow
async function handler() {
  const rows = await deleteExpiredEmailVerificationCodes()

  return NextResponse.json({ success: true, rows }, { status: StatusCodes.OK })
}

export const POST = env.MOCK_QSTASH
  ? handler
  : verifySignatureAppRouter(handler)
