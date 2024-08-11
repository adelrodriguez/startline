"server-only"

import db, { type User, password } from "@/server/db"
import { hash, verify } from "@node-rs/argon2"

export async function createPassword(userId: User["id"], input: string) {
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

export async function findPassword(userId: User["id"]) {
  const password = await db.query.password.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
  })

  return password ?? null
}

export async function verifyPassword(userId: User["id"], input: string) {
  const password = await findPassword(userId)

  if (!password) {
    return false
  }

  return verify(password.hash, input)
}
