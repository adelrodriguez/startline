import Sqids from "sqids"

const sqids = new Sqids({ minLength: 6 })

/**
 * Encode an id into a URL-safe string. Use it to hide auto-incremental ids.
 */
export function obfuscate(id: number): string {
  return sqids.encode([id])
}

/**
 * Decode an obfuscated id into a number.
 */
export function deobfuscate(encoded: string): number {
  const [decoded] = sqids.decode(encoded)

  if (decoded === undefined) {
    throw new Error("Invalid encoded id")
  }

  return decoded
}
