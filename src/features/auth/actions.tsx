"use server"

// TODO: See if we can make it work with Convex

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { flattenValidationErrors } from "next-safe-action"
import {
  SignInWithPasswordFormDataSchema,
  SignUpFormDataSchema,
} from "~/features/auth/validation"
import { publicAction } from "~/shared/action-client"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"

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
    const { user } = await ctx.auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })

    ctx.logger.info({ user }, "Signed in with password")

    redirect(AUTHORIZED_PATHNAME)
  })
