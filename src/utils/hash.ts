import Argon2 from "@node-rs/argon2"
import { sha256 } from "@oslojs/crypto/sha2"
import { encodeHexLowerCase } from "@oslojs/encoding"

/**
 * We use these hash functions for email verification codes, sign-in codes, and
 * password reset tokens, since they are short lived.
 *
 * For passwords, use the `@node-rs/argon2` library.
 */
export const sha = {
  sha256: {
    hash(value: string): string {
      const encoded = new TextEncoder().encode(value)
      const hashed = sha256(encoded)

      return encodeHexLowerCase(hashed)
    },
    verify(hashed: string, value: string): boolean {
      return hashed === this.hash(value)
    },
  },
}

export const argon2 = {
  hash(value: string): Promise<string> {
    return Argon2.hash(value)
  },
  verify(hashed: string, value: string): Promise<boolean> {
    return Argon2.verify(hashed, value)
  },
}
