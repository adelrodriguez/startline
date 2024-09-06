import "server-only"

import { TimeSpan, createDate } from "oslo"
import { alphabet, generateRandomString } from "oslo/crypto"
import { SignInCodeEmail } from "~/components/emails"
import { sendEmail } from "~/lib/emails"
import db, { filters, signInCode } from "~/server/db"
import { hash, verify } from "~/utils/hash"

export async function sendSignInCode(email: string) {
  // Delete old codes
  await deleteSignInCode(email)

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await db.insert(signInCode).values({
    email,
    hash: await hash(code),
    expiresAt: createDate(new TimeSpan(15, "m")),
  })

  await sendEmail(email, "Sign in code", SignInCodeEmail({ code }))
}

export async function verifySignInCode(email: string, code: string) {
  const signInCode = await db.query.signInCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.email, email), gte(model.expiresAt, new Date())),
  })

  if (!signInCode) return false

  const isValidCode = await verify(signInCode.hash, code)

  if (!isValidCode) return false

  // Delete the verified code
  await deleteSignInCode(email)

  return true
}

export function deleteSignInCode(email: string) {
  return db
    .delete(signInCode)
    .where(filters.eq(signInCode.email, email))
    .returning()
}

export async function cleanExpiredSignInCodes() {
  const result = await db
    .delete(signInCode)
    .where(filters.lt(signInCode.expiresAt, new Date()))

  return result.rowsAffected
}
