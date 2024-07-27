import { alphabet, generateRandomString } from "oslo/crypto"
import {
  batch,
  deleteVerifyEmailCode,
  insertVerifyEmailCode,
  selectVerifyEmailCode,
  updateUser,
  type User,
} from "@/server/db"
import { addHours } from "date-fns"
import { hash, verify } from "@node-rs/argon2"
import { VerifyEmailCodeEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"

export async function sendVerifyEmailCode(user: User) {
  // Delete old codes
  await deleteVerifyEmailCode({ userId: user.id })

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await insertVerifyEmailCode({
    userId: user.id,
    hash: await hash(code),
    expiresAt: addHours(new Date(), 24),
  })

  await sendEmail(user.email, "Verify email", VerifyEmailCodeEmail({ code }))
}

export async function verifyVerifyEmailCode(userId: User["id"], code: string) {
  const verifyEmailCode = await selectVerifyEmailCode({ userId })

  if (!verifyEmailCode) return false

  const isValidCode = await verify(verifyEmailCode.hash, code)

  if (!isValidCode) return false

  await batch([
    updateUser(userId, { emailVerifiedAt: new Date() }),
    deleteVerifyEmailCode({ userId }),
  ])

  return true
}
