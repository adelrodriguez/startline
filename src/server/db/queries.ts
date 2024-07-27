"server-only"

import { eq, type SQL } from "drizzle-orm"
import db from "./client"
import {
  type PasswordValues,
  type SignInCode,
  type SignInCodeValues,
  type User,
  type UserValues,
  type EmailVerificationCode,
  type EmailVerificationCodeValues,
  type WebhookEvent,
  type WebhookEventValues,
  password,
  signInCode,
  user,
  emailVerificationCode,
  webhookEvent,
} from "./schema"
import { QueryError } from "@/utils/error"

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

      throw new QueryError("selectUser")
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
    .set({ ...values, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning()
}

export function upsertUser(values: OmitId<UserValues>) {
  return db
    .insert(user)
    .values(values)
    .onConflictDoUpdate({
      target: user.email,
      set: { ...values, updatedAt: new Date() },
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

// Sign In Code
export function selectSignInCode(query: { email: SignInCode["email"] }) {
  return db.query.signInCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.email, query.email), gte(model.expiresAt, new Date())),
  })
}

export function insertSignInCode(values: OmitId<SignInCodeValues>) {
  return db.insert(signInCode).values(values).returning().get()
}

export function deleteSignInCode(
  query: { hash: SignInCode["hash"] } | { email: SignInCode["email"] },
) {
  let condition: SQL

  if ("hash" in query) {
    condition = eq(signInCode.hash, query.hash)
  } else if ("email" in query) {
    condition = eq(signInCode.email, query.email)
  } else {
    throw new QueryError("deleteSignInCode")
  }

  return db.delete(signInCode).where(condition)
}

// Email Verification Code
export function selectEmailVerificationCode(query: { userId: User["id"] }) {
  let condition: SQL

  if ("userId" in query) {
    condition = eq(emailVerificationCode.userId, query.userId)
  }

  return db.query.emailVerificationCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.userId, query.userId), gte(model.expiresAt, new Date())),
  })
}

export function insertEmailVerificationCode(
  values: OmitId<EmailVerificationCodeValues>,
) {
  return db.insert(emailVerificationCode).values(values).returning().get()
}

export function deleteEmailVerificationCode(
  query: { hash: EmailVerificationCode["hash"] } | { userId: User["id"] },
) {
  let condition: SQL

  if ("hash" in query) {
    condition = eq(emailVerificationCode.hash, query.hash)
  } else if ("userId" in query) {
    condition = eq(emailVerificationCode.userId, query.userId)
  } else {
    throw new QueryError("deleteEmailVerificationCode")
  }

  return db.delete(emailVerificationCode).where(condition)
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

      throw new QueryError("selectWebhookEvent")
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
