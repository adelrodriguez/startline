import type { WebhookEvent } from "@/server/db"
import type Stripe from "stripe"

type Event<T> = {
  data: T
}

type EventMap = {
  "demo/hello-world": { date: Date }
  "stripe/webhook-event": {
    payload: Stripe.Event
    webhookEventId: WebhookEvent["id"]
  }
}

export type Events = { [key in keyof EventMap]: Event<EventMap[key]> }
