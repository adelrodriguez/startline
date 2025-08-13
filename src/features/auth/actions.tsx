"use server"

import { fetchMutation } from "convex/nextjs"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { flattenValidationErrors } from "next-safe-action"
import {
  SignInWithPasswordFormDataSchema,
  SignUpFormDataSchema,
} from "~/features/auth/validation"
import { publicAction } from "~/shared/action-client"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"
import { api } from "~~/convex/_generated/api"

export const signUp = publicAction
  .metadata({ name: "auth.signUp" })
  .inputSchema(SignUpFormDataSchema, {
    handleValidationErrorsShape: async (errors) =>
      flattenValidationErrors(errors),
  })
  .stateAction(async ({ parsedInput: { email, password, name }, ctx }) => {
    const { user } = await ctx.auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    })

    ctx.logger.info({ user }, "Created user")

    redirect(AUTHORIZED_PATHNAME)
  })

export const signInWithPassword = publicAction
  .metadata({ name: "auth.signInWithPassword" })
  .inputSchema(SignInWithPasswordFormDataSchema, {
    handleValidationErrorsShape: async (errors) =>
      flattenValidationErrors(errors),
  })
  .stateAction(async ({ parsedInput: { email, password }, ctx }) => {
    const user = await fetchMutation(api.auth.signInWithPassword, {
      email,
      password,
    })

    ctx.logger.info({ user }, "Signed in with password")

    redirect(AUTHORIZED_PATHNAME)
  })
