import db, { profile, type User } from "@/server/db"

export async function createProfile(
  userId: User["id"],
  values: Omit<typeof profile.$inferInsert, "id" | "userId">,
) {
  return db
    .insert(profile)
    .values({ ...values, userId })
    .onConflictDoNothing()
    .returning()
    .get()
}
