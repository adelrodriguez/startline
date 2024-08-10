import Sqids from "sqids"

const sqids = new Sqids({ minLength: 6 })

export function encode(id: number): string {
  return sqids.encode([id])
}

export function decode(encoded: string): number {
  const [decoded] = sqids.decode(encoded)

  if (decoded === undefined) {
    throw new Error("Invalid encoded id")
  }

  return decoded
}
