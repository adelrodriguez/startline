// We use these hash functions for email verification codes, sign-in codes,
// and password reset tokens, since they are short lived. For passwords, use the @@node-rs/argon2 library.
import { sha256 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"

export async function hash(value: string) {
  return encodeHex(await sha256(new TextEncoder().encode(value)))
}

export async function verify(hashed: string, value: string) {
  const hashedValue = await hash(value)

  return hashed === hashedValue
}
