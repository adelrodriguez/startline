"server-only"

import { PasswordResetTokenEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"
import {
  batch,
  deletePasswordResetToken,
  insertPasswordResetToken,
  selectPasswordResetToken,
  updateUser,
  type PasswordResetToken,
  type User,
} from "@/server/db"
import { hash } from "@/utils/hash"
import { generateIdFromEntropySize, TimeSpan } from "lucia"
import { createDate } from "oslo"

export async function findPasswordResetToken(token: string) {
  const passwordResetToken = await selectPasswordResetToken({
    hash: await hash(token),
  })

  return passwordResetToken ?? null
}

export async function sendPasswordResetToken(user: User) {
  await deletePasswordResetToken({ userId: user.id })

  const token = generateIdFromEntropySize(25)

  await insertPasswordResetToken({
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
  await batch([
    deletePasswordResetToken({ userId: token.userId }),
    // If the user received received the password reset token and it was
    // verified, we can mark the user as verified.
    updateUser(token.userId, { emailVerifiedAt: new Date() }),
  ])
}
