import env from "@/lib/env.server"
import { parseJobRequest } from "@/lib/jobs"
import { markWebhookEventAsProcessed } from "@/server/data"
import { StripeError } from "@/utils/error"
import { verifySignatureEdge } from "@upstash/qstash/nextjs"
import { type NextRequest, NextResponse } from "next/server"

async function handler(request: NextRequest) {
  const { stripeEvent, eventId } = await parseJobRequest(
    "stripe/process-webhook-event",
    request,
  )

  console.log("Received webhook event", eventId, stripeEvent)

  switch (stripeEvent.type) {
    case "customer.subscription.created":
      break
    // Handle the necessary events here
    default:
      throw new StripeError(`Unhandled event type: ${stripeEvent.type}`)
  }

  await markWebhookEventAsProcessed(eventId)

  return NextResponse.json({ success: true })
}

export const POST = env.MOCK_QSTASH ? handler : verifySignatureEdge(handler)

export const runtime = "edge"
