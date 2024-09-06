import "server-only"

import { hash, verify } from "@node-rs/argon2"
import db, { type UserId, password } from "~/server/db"

export async function createPassword(userId: UserId, input: string) {
  const hashedPassword = await hash(input)

  return db
    .insert(password)
    .values({ hash: hashedPassword, userId })
    .onConflictDoUpdate({
      target: password.userId,
      set: { hash: hashedPassword },
    })
    .returning()
    .get()
}

export async function findPassword(userId: UserId) {
  const password = await db.query.password.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
  })

  return password ?? null
}

export async function verifyPassword(userId: UserId, input: string) {
  const password = await findPassword(userId)

  if (!password) {
    return false
  }

  return verify(password.hash, input)
}
