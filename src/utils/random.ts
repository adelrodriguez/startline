import { getRandomValues } from "node:crypto"
import { generateRandomString, type RandomReader } from "@oslojs/crypto/random"

const lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
const uppercaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

class RandomGenerator implements RandomReader {
  read(bytes: Uint8Array): void {
    getRandomValues(bytes)
  }
}

export function generateRandomLowercaseString(length: number): string {
  return generateRandomString(new RandomGenerator(), lowercaseAlphabet, length)
}

export function generateRandomUppercaseString(length: number): string {
  return generateRandomString(new RandomGenerator(), uppercaseAlphabet, length)
}
