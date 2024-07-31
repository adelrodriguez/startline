"server-only"

import { SignInCodeEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"
import {
  deleteSignInCode,
  insertSignInCode,
  selectSignInCode,
} from "@/server/db"
import { hash, verify } from "@/utils/hash"
import { TimeSpan, createDate } from "oslo"
import { alphabet, generateRandomString } from "oslo/crypto"

export async function sendSignInCode(email: string) {
  // Delete old codes
  await deleteSignInCode({ email })

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await insertSignInCode({
    email,
    hash: await hash(code),
    expiresAt: createDate(new TimeSpan(15, "m")),
  })

  await sendEmail(email, "Sign in code", SignInCodeEmail({ code }))
}

export async function verifySignInCode(email: string, code: string) {
  const signInCode = await selectSignInCode({ email })

  if (!signInCode) return false

  const isValidCode = await verify(signInCode.hash, code)

  if (!isValidCode) return false

  // Delete the verified code
  await deleteSignInCode({ email })

  return true
}
