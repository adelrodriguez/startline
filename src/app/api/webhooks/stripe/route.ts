import { StatusCodes } from "http-status-codes"
import { NextResponse } from "next/server"
import env from "~/lib/env.server"
import { enqueueJob } from "~/lib/jobs"
import { withLogger } from "~/lib/logger"
import {
  createWebhookEvent,
  findWebhookEventByExternalId,
} from "~/server/data/webhook-event"
import stripe from "~/services/stripe"

export const POST = withLogger(async (req) => {
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new NextResponse(null, {
      status: StatusCodes.UNAUTHORIZED,
    })
  }

  const body = await req.text()

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  )

  const processedWebhookEvent = await findWebhookEventByExternalId(event.id)

  if (processedWebhookEvent?.processedAt) {
    req.log.info("Webhook event already processed", {
      webhookEventId: event.id,
    })

    return NextResponse.json(
      {
        success: false,
        processedAt: processedWebhookEvent.processedAt,
        reason: "Webhook event already processed",
      },
      { status: StatusCodes.OK }
    )
  }

  const newWebhookEvent = await createWebhookEvent({
    event: event.type,
    provider: "stripe",
    externalId: event.id,
    payload: event.data,
  })

  await enqueueJob("stripe/process-webhook-event", {
    webhookEventId: newWebhookEvent.id.toString(),
    stripeEvent: event,
  })

  return NextResponse.json(
    { success: true, receivedAt: new Date() },
    { status: StatusCodes.OK }
  )
})
