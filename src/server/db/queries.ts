"server-only"

import { eq } from "drizzle-orm"
import db from "./client"
import {
  type PasswordValues,
  type User,
  type UserValues,
  type WebhookEvent,
  type WebhookEventValues,
  password,
  user,
  webhookEvent,
} from "./schema"

type OmitId<T> = Omit<T, "id">
type OmitUserId<T> = Omit<T, "userId">

// User
export function selectUser(
  query:
    | User["id"]
    | { email: string }
    | { googleId: string }
    | { githubId: string },
) {
  return db.query.user.findFirst({
    where: (model, { eq }) => {
      if (typeof query === "number") {
        return eq(model.id, query)
      }

      if ("email" in query) {
        return eq(model.email, query.email)
      }

      if ("googleId" in query) {
        return eq(model.googleId, query.googleId)
      }

      if ("githubId" in query) {
        return eq(model.githubId, query.githubId)
      }

      return undefined
    },
  })
}

export function insertUser(values: OmitId<UserValues>) {
  return db.insert(user).values(values).returning().get()
}

export function updateUser(
  userId: User["id"],
  values: Partial<OmitId<UserValues>>,
) {
  return db
    .update(user)
    .set(values)
    .where(eq(user.id, userId))
    .returning()
    .get()
}

export function upsertUser(values: OmitId<UserValues>) {
  return db
    .insert(user)
    .values(values)
    .onConflictDoUpdate({
      target: user.email,
      set: values,
    })
    .returning()
    .get()
}

// Password
export function selectPassword(userId: User["id"]) {
  return db.query.password.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
  })
}

export function insertPassword(
  userId: User["id"],
  values: OmitUserId<PasswordValues>,
) {
  return db
    .insert(password)
    .values({ ...values, userId })
    .returning()
    .get()
}

// Webhook Event
export function selectWebhookEvent(
  query: WebhookEvent["id"] | { externalId: string },
) {
  return db.query.webhookEvent.findFirst({
    where: (model, { eq }) => {
      if (typeof query === "number") {
        return eq(model.id, query)
      }

      if ("externalId" in query) {
        return eq(model.externalId, query.externalId)
      }

      return undefined
    },
  })
}

export function insertWebhookEvent(values: OmitId<WebhookEventValues>) {
  return db.insert(webhookEvent).values(values).returning().get()
}

export function updateWebhookEvent(
  webhookEventId: WebhookEvent["id"],
  values: Partial<OmitId<WebhookEventValues>>,
) {
  return db
    .update(webhookEvent)
    .set(values)
    .where(eq(webhookEvent.id, webhookEventId))
    .returning()
    .get()
}
