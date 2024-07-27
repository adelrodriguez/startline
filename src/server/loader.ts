import { validateRequest } from "@/lib/auth"
import { UNAUTHORIZED_URL } from "@/lib/consts"
import { redirect } from "next/navigation"
import { findUserById } from "./data"
import { throwUnless } from "@/utils/assert"
import { cache } from "react"

export const getCurrentUser = cache(async () => {
  const { user: authUser } = await validateRequest()

  if (!authUser) {
    return redirect(UNAUTHORIZED_URL)
  }

  const user = await findUserById(authUser.id)

  throwUnless(user !== null, "User does not exist")

  return user
})
