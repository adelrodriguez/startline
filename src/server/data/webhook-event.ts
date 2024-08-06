"server-only"

import {
  type WebhookEvent,
  insertWebhookEvent,
  selectWebhookEvent,
  updateWebhookEvent,
  type webhookEvent,
} from "@/server/db"

export async function findWebhookEventByExternalId(
  externalId: WebhookEvent["externalId"],
) {
  const webhookEvent = await selectWebhookEvent({ externalId })

  return webhookEvent ?? null
}

export async function createWebhookEvent(
  values: Omit<typeof webhookEvent.$inferInsert, "id" | "payload"> & {
    payload: unknown
  },
) {
  const webhookEvent = await insertWebhookEvent({
    ...values,
    payload: JSON.stringify(values.payload),
  })

  return webhookEvent
}

export async function markWebhookEventAsProcessed(
  webhookEventId: WebhookEvent["id"],
) {
  const webhookEvent = await updateWebhookEvent(webhookEventId, {
    processedAt: new Date(),
  })

  return webhookEvent
}
