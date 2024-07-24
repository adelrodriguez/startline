import { alphabet, generateRandomString } from "oslo/crypto"
import {
  deleteSignInCode,
  insertSignInCode,
  selectSignInCode,
} from "@/server/db"
import { addMinutes } from "date-fns"
import { hash, verify } from "@node-rs/argon2"
import { SignInCodeEmail } from "@/components/emails"
import { sendEmail } from "@/lib/emails"

export async function sendSignInCode(email: string) {
  // Delete old codes
  await deleteSignInCode({ email })

  const code = await generateRandomString(6, alphabet("0-9"))

  await insertSignInCode({
    email,
    hash: await hash(code),
    expiresAt: addMinutes(new Date(), 10),
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
