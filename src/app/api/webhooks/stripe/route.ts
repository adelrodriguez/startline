import stripe from "@/services/stripe"
import { StatusCodes } from "http-status-codes"
import { NextResponse, type NextRequest } from "next/server"
import env from "@/lib/env.server"
import {
  createWebhookEvent,
  findWebhookEventByExternalId,
  markWebhookEventAsProcessed,
} from "@/server/data"
import type Stripe from "stripe"
import { StripeError } from "@/utils/error"

export async function POST(req: NextRequest): Promise<NextResponse> {
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
    env.STRIPE_WEBHOOK_SECRET,
  )

  const webhookEvent = await findWebhookEventByExternalId(event.id)

  if (webhookEvent?.processedAt) {
    console.info("Webhook event already processed")

    return NextResponse.json(
      {
        success: false,
        processedAt: webhookEvent.processedAt,
        reason: "Webhook event already processed",
      },
      { status: StatusCodes.OK },
    )
  }

  const newWebhookEvent = await createWebhookEvent({
    event: event.type,
    provider: "stripe",
    externalId: event.id,
    payload: event.data,
  })

  try {
    await handleEvent(event)

    const { processedAt } = await markWebhookEventAsProcessed(
      newWebhookEvent.id,
    )

    return NextResponse.json(
      { success: true, processedAt },
      { status: StatusCodes.OK },
    )
  } catch (e) {
    console.error("Error handling Stripe webhook event", e)

    return NextResponse.json(
      { success: false, reason: (e as Error).message },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      },
    )
  }
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    // Handle the necessary events here
    default:
      throw new StripeError(`Unhandled event type: ${event.type}`)
  }
}
