import Argon2 from "@node-rs/argon2"
import { sha256 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"

/**
 * We use these hash functions for email verification codes, sign-in codes, and
 * password reset tokens, since they are short lived.
 *
 * For passwords, use the `@node-rs/argon2` library.
 */
export const sha = {
  sha256: {
    async hash(value: string) {
      const encoded = new TextEncoder().encode(value)
      const hashed = await sha256(encoded)

      return encodeHex(hashed)
    },
    async verify(hashed: string, value: string) {
      return hashed === (await this.hash(value))
    },
  },
}

export const argon2 = {
  async hash(value: string) {
    return Argon2.hash(value)
  },
  async verify(hashed: string, value: string) {
    return Argon2.verify(hashed, value)
  },
}
