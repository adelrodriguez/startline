import "server-only"

import { DatabaseError } from "~/lib/error"
import db, { filters, webhookEvent, helpers } from "~/server/db"
import type { StrictOmit } from "~/utils/type"

export type WebhookEvent = typeof webhookEvent.$inferSelect
export type NewWebhookEvent = typeof webhookEvent.$inferInsert
export type WebhookEventId = WebhookEvent["id"]

export async function findWebhookEventByExternalId(externalId: string) {
  const webhookEvent = await db.query.webhookEvent.findFirst({
    where: (model, { eq }) => eq(model.externalId, externalId),
  })

  return webhookEvent ?? null
}

export async function createWebhookEvent(
  values: StrictOmit<NewWebhookEvent, "payload"> & {
    payload: unknown
  },
): Promise<WebhookEvent> {
  const [newWebhookEvent] = await db
    .insert(webhookEvent)
    .values({
      ...values,
      payload: values.payload,
    })
    .onConflictDoUpdate({
      target: webhookEvent.externalId,
      set: { retries: helpers.increment(webhookEvent.retries) },
    })
    .returning()

  if (!newWebhookEvent) {
    throw new DatabaseError("Failed to create webhook event")
  }

  return newWebhookEvent
}

export async function markWebhookEventAsProcessed(
  id: WebhookEventId,
): Promise<void> {
  await db
    .update(webhookEvent)
    .set({ processedAt: new Date() })
    .where(filters.eq(webhookEvent.id, id))
}
