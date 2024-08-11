"server-only"

import { PasswordResetTokenEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"
import db, {
  type PasswordResetToken,
  type User,
  filters,
  passwordResetToken,
} from "@/server/db"
import { hash } from "@/utils/hash"
import { TimeSpan, generateIdFromEntropySize } from "lucia"
import { createDate } from "oslo"
import { markUserAsEmailVerified } from "./user"

export async function findValidPasswordResetToken(input: string) {
  const hashed = await hash(input)

  const token = await db.query.passwordResetToken.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.hash, hashed), gte(model.expiresAt, new Date())),
  })

  return token ?? null
}

export async function sendPasswordResetToken(user: User) {
  await deletePasswordResetToken(user.id)

  const token = generateIdFromEntropySize(25)

  await db.insert(passwordResetToken).values({
    userId: user.id,
    hash: await hash(token),
    expiresAt: createDate(new TimeSpan(24, "h")),
  })

  await sendEmail(
    user.email,
    "Reset your password",
    PasswordResetTokenEmail({ token }),
  )
}

export async function markPasswordResetTokenAsUsed(token: PasswordResetToken) {
  await db.batch([
    deletePasswordResetToken(token.userId),
    // If the user received received the password reset token and it was
    // verified, we can mark the user as verified.
    markUserAsEmailVerified(token.userId),
  ])
}

export function deletePasswordResetToken(userId: User["id"]) {
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
