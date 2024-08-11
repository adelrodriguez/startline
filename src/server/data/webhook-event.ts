"server-only"

import db, { filters, type WebhookEvent, webhookEvent } from "@/server/db"

export async function findWebhookEventByExternalId(
  externalId: WebhookEvent["externalId"],
) {
  const webhookEvent = await db.query.webhookEvent.findFirst({
    where: (model, { eq }) => eq(model.externalId, externalId),
  })

  return webhookEvent ?? null
}

export async function createWebhookEvent(
  values: Omit<typeof webhookEvent.$inferInsert, "id" | "payload"> & {
    payload: unknown
  },
) {
  return db
    .insert(webhookEvent)
    .values({
      ...values,
      payload: JSON.stringify(values.payload),
    })
    .returning()
    .get()
}

export async function markWebhookEventAsProcessed(id: WebhookEvent["id"]) {
  return db
    .update(webhookEvent)
    .set({ processedAt: new Date() })
    .where(filters.eq(webhookEvent.id, id))
    .returning()
    .get()
}
