import db, { profile, type User } from "@/server/db"
import type { OmitUserId } from "@/utils/type"

export async function createProfile(
  userId: User["id"],
  values: OmitUserId<typeof profile.$inferInsert>,
) {
  return db
    .insert(profile)
    .values({ ...values, userId })
    .onConflictDoNothing()
    .returning()
    .get()
}
