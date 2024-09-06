import db, { profile, type UserId } from "~/server/db"
import type { StrictOmit } from "~/utils/type"

export async function createProfile(
  userId: UserId,
  values: StrictOmit<typeof profile.$inferInsert, "userId">,
) {
  return db
    .insert(profile)
    .values({ ...values, userId })
    .onConflictDoNothing()
    .returning()
    .get()
}
