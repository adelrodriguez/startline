"server-only"

import {
  type WebhookEvent,
  type WebhookEventValues,
  insertWebhookEvent,
  selectWebhookEvent,
  updateWebhookEvent,
} from "@/server/db"

export async function findWebhookEventByExternalId(
  externalId: WebhookEvent["externalId"],
) {
  const webhookEvent = await selectWebhookEvent({ externalId })

  return webhookEvent ?? null
}

export async function createWebhookEvent(
  values: Omit<WebhookEventValues, "id" | "payload"> & { payload: unknown },
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
