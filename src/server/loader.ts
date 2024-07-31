import { validateRequest } from "@/lib/auth"
import { UNAUTHORIZED_URL } from "@/lib/consts"
import { throwUnless } from "@/utils/assert"
import { redirect } from "next/navigation"
import { cache } from "react"
import { findUserById } from "./data"

export const getCurrentUser = cache(async () => {
  const { user: authUser } = await validateRequest()

  if (!authUser) {
    return redirect(UNAUTHORIZED_URL)
  }

  const user = await findUserById(authUser.id)

  throwUnless(user !== null, "User does not exist")

  return user
})
