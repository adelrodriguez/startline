import type { Session, User } from "~/server/data/user"

// TODO: Actually implement this
export async function validateRequest() {
  return (await Promise.resolve({
    user: null,
    session: null,
  })) as { user: User | null; session: Session | null }
}
