"server-only"

import { alphabet, generateRandomString } from "oslo/crypto"
import {
  batch,
  deleteEmailVerificationCode,
  insertEmailVerificationCode,
  selectEmailVerificationCode,
  updateUser,
  type User,
} from "@/server/db"
import { EmailVerificationCodeEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"
import { createDate, TimeSpan } from "oslo"
import { hash, verify } from "@/utils/hash"

export async function sendEmailVerificationCode(user: User) {
  // Delete old codes
  await deleteEmailVerificationCode({ userId: user.id })

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await insertEmailVerificationCode({
    userId: user.id,
    hash: await hash(code),
    expiresAt: createDate(new TimeSpan(24, "h")),
  })

  await sendEmail(
    user.email,
    "Verify email",
    EmailVerificationCodeEmail({ code }),
  )
}

export async function verifyEmailVerificationCode(
  userId: User["id"],
  code: string,
) {
  const emailVerificationCode = await selectEmailVerificationCode({ userId })

  if (!emailVerificationCode) return false

  const isValidCode = await verify(emailVerificationCode.hash, code)

  if (!isValidCode) return false

  await batch([
    updateUser(userId, { emailVerifiedAt: new Date() }),
    deleteEmailVerificationCode({ userId }),
  ])

  return true
}
