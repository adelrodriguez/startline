import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { type NextRequest, NextResponse } from "next/server"
import env from "~/lib/env.server"
import { parseJobRequest } from "~/lib/jobs"
import {
  type WebhookEventId,
  markWebhookEventAsProcessed,
} from "~/server/data/webhook-event"
import { StripeError } from "~/utils/error"

async function handler(request: NextRequest) {
  const { stripeEvent, webhookEventId } = await parseJobRequest(
    "stripe/process-webhook-event",
    request,
  )

  console.log("Received webhook event", webhookEventId, stripeEvent)

  switch (stripeEvent.type) {
    case "customer.subscription.created":
      break
    // Handle the necessary events here
    default:
      throw new StripeError(`Unhandled event type: ${stripeEvent.type}`)
  }

  await markWebhookEventAsProcessed(BigInt(webhookEventId) as WebhookEventId)

  return NextResponse.json({ success: true })
}

export const POST = env.MOCK_QSTASH
  ? handler
  : verifySignatureAppRouter(handler)
