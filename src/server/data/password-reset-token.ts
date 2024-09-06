import "server-only"

import { PasswordResetTokenEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"
import db, { type UserId, filters, passwordResetToken } from "@/server/db"
import { hash } from "@/utils/hash"
import { generateIdFromEntropySize } from "lucia"
import { TimeSpan, createDate } from "oslo"
import { markUserAsEmailVerified } from "./user"

export async function findValidPasswordResetToken(input: string) {
  const hashed = await hash(input)

  const token = await db.query.passwordResetToken.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.hash, hashed), gte(model.expiresAt, new Date())),
  })

  return token ?? null
}

export async function sendPasswordResetToken(userId: UserId, email: string) {
  await deletePasswordResetTokens(userId)

  const token = generateIdFromEntropySize(25)

  await db.insert(passwordResetToken).values({
    userId,
    hash: await hash(token),
    expiresAt: createDate(new TimeSpan(24, "h")),
  })

  await sendEmail(
    email,
    "Reset your password",
    PasswordResetTokenEmail({ token }),
  )
}

export async function markPasswordResetTokenAsUsed(userId: UserId) {
  await db.batch([
    deletePasswordResetTokens(userId),
    // If the user received received the password reset token and it was
    // verified, we can mark the user as verified.
    markUserAsEmailVerified(userId),
  ])
}

export function deletePasswordResetTokens(userId: UserId) {
  return db
    .delete(passwordResetToken)
    .where(filters.eq(passwordResetToken.userId, userId))
    .returning()
}

export async function cleanExpiredPasswordResetTokens() {
  const result = await db
    .delete(passwordResetToken)
    .where(filters.lt(passwordResetToken.expiresAt, new Date()))

  return result.rowsAffected
}
