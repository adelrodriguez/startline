"server-only"

import { type User, insertPassword, selectPassword } from "@/server/db"
import { hash, verify } from "@node-rs/argon2"

export async function createPassword(userId: User["id"], password: string) {
  return await insertPassword(userId, { hash: await hash(password) })
}

export async function findPassword(userId: User["id"]) {
  const password = await selectPassword(userId)

  return password ?? null
}

export async function verifyPassword(userId: User["id"], input: string) {
  const password = await findPassword(userId)

  if (!password) {
    return false
  }

  return await verify(password.hash, input)
}
