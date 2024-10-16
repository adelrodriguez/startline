import "server-only"

import { z } from "zod"
import db, { filters, webhookEvent, helpers } from "~/server/db"
import { DatabaseError } from "~/utils/error"
import type { StrictOmit } from "~/utils/type"

export type WebhookEvent = typeof webhookEvent.$inferSelect
export type NewWebhookEvent = typeof webhookEvent.$inferInsert

export const WebhookEventId = z.bigint().brand<"WebhookEventId">()
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
  values: StrictOmit<NewWebhookEvent, "payload"> & {
    payload: unknown
  },
): Promise<WebhookEvent> {
  const [newWebhookEvent] = await db
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

  if (!newWebhookEvent) {
    throw new DatabaseError("Failed to create webhook event")
  }

  return newWebhookEvent
}

export async function markWebhookEventAsProcessed(
  id: WebhookEventId,
): Promise<WebhookEvent> {
  const [updatedWebhookEvent] = await db
    .update(webhookEvent)
    .set({ processedAt: new Date() })
    .where(filters.eq(webhookEvent.id, id))
    .returning()

  if (!updatedWebhookEvent) {
    throw new DatabaseError("Failed to mark webhook event as processed")
  }

  return updatedWebhookEvent
}
