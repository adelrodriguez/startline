import type Stripe from "stripe"
import { z } from "zod"

export const StripeProcessWebhookEventPayloadSchema = z.object({
  /**
   * The webhook event payload.
   */
  stripeEvent: z.custom<Stripe.Event>(),
  /**
   * The webhook event ID. Use it to mark the event as processed.
   */
  webhookEventId: z.string(),
})
