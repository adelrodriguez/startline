import env from "@/lib/env.server"
import { createWebhookEvent, findWebhookEventByExternalId } from "@/server/data"
import inngest from "@/services/inngest"
import stripe from "@/services/stripe"
import chalk from "chalk"
import { StatusCodes } from "http-status-codes"
import { type NextRequest, NextResponse } from "next/server"

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

  const processedWebhookEvent = await findWebhookEventByExternalId(event.id)

  if (processedWebhookEvent?.processedAt) {
    console.info(chalk.blue("Webhook event already processed"))

    return NextResponse.json(
      {
        success: false,
        processedAt: processedWebhookEvent.processedAt,
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

  await inngest.send({
    name: "stripe/webhook-event",
    data: { payload: event, webhookEventId: newWebhookEvent.id },
  })

  return NextResponse.json(
    { success: true, receivedAt: new Date() },
    { status: StatusCodes.OK },
  )
}
