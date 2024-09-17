import "server-only"

import { z } from "zod"
import db, { filters, webhookEvent, helpers } from "~/server/db"
import type { StrictOmit } from "~/utils/type"

export type WebhookEvent = typeof webhookEvent.$inferSelect
export type NewWebhookEvent = typeof webhookEvent.$inferInsert

export const WebhookEventId = z.number().brand<"WebhookEventId">()
export type WebhookEventId = z.infer<typeof WebhookEventId>

export async function findWebhookEventByExternalId(
  externalId: WebhookEvent["externalId"],
) {
  const webhookEvent = await db.query.webhookEvent.findFirst({
    where: (model, { eq }) => eq(model.externalId, externalId),
  })

  return webhookEvent ?? null
}

export async function createWebhookEvent(
  values: StrictOmit<NewWebhookEvent, "id" | "payload"> & {
    payload: unknown
  },
) {
  return db
    .insert(webhookEvent)
    .values({
      ...values,
      payload: JSON.stringify(values.payload),
    })
    .onConflictDoUpdate({
      target: webhookEvent.externalId,
      set: { retries: helpers.increment(webhookEvent.retries) },
    })
    .returning()
    .get()
}

export async function markWebhookEventAsProcessed(id: WebhookEventId) {
  return db
    .update(webhookEvent)
    .set({ processedAt: new Date() })
    .where(filters.eq(webhookEvent.id, id))
    .returning()
    .get()
}
