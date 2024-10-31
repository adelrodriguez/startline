"use server"

import { returnValidationErrors } from "next-safe-action"
import { cookies } from "next/headers"
import { RedirectType, redirect } from "next/navigation"
import { z } from "zod"
import {
  invalidateSession,
  invalidateUserSessions,
  setSession,
} from "~/lib/auth/session"
import {
  AUTHORIZED_URL,
  DEFAULT_ORGANIZATION_NAME,
  RESET_PASSWORD_URL,
  UNAUTHORIZED_URL,
} from "~/lib/consts"
import env from "~/lib/env.server"
import { PasswordResetError } from "~/lib/error"
import {
  actionClient,
  authActionClient,
  withRateLimitByIp,
  withRateLimitByUser,
} from "~/lib/safe-action"
import {
  CheckEmailVerificationCodeSchema,
  CheckSignInWithCodeSchema,
  NewPasswordSchema,
  RequestPasswordResetSchema,
  SignInWithCodeSchema,
  SignInWithPasswordSchema,
  SignUpSchema,
} from "~/lib/validation/forms"
import { isProduction } from "~/lib/vars"
import { createActivityLog } from "~/server/data/activity-log"
import { createOrganization } from "~/server/data/organization"
import {
  createPassword,
  createProfile,
  createUser,
  findUserByEmail,
  findValidPasswordResetToken,
  markPasswordResetTokenAsUsed,
  markUserAsEmailVerified,
  sendEmailVerificationCode,
  sendPasswordResetToken,
  sendSignInCode,
  verifyEmailVerificationCode,
  verifyPassword,
  verifySignInCode,
} from "~/server/data/user"

const VERIFICATION_EMAIL_COOKIE_NAME = "verification-email"

export const signUp = actionClient
  .metadata({ actionName: "auth/signUp" })
  .use(withRateLimitByIp)
  .schema(SignUpSchema)
  .action(async ({ parsedInput: { email, password, name } }) => {
    if (!env.AUTH_PASSWORD) {
      throw new Error("Password authentication is disabled")
    }

    const newUser = await createUser({ email })

    await createProfile(newUser.id, { name })
    await createPassword(newUser.id, password)
    await sendEmailVerificationCode(newUser.id, email)

    await createActivityLog("requested_email_verification", {
      userId: newUser.id,
    })
    await createActivityLog("signed_up_with_password", { userId: newUser.id })

    const newOrganization = await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: newUser.id },
    )

    await createActivityLog("created_organization", {
      userId: newUser.id,
      organizationId: newOrganization.id,
    })

    await setSession(newUser.id)

    redirect(AUTHORIZED_URL)
  })

export const signInWithPassword = actionClient
  .metadata({ actionName: "auth/signInWithPassword" })
  .use(withRateLimitByIp)
  .schema(SignInWithPasswordSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    if (!env.AUTH_PASSWORD) {
      throw new Error("Password authentication is disabled")
    }

    const existingUser = await findUserByEmail(email)

    if (!existingUser) {
      returnValidationErrors(SignInWithPasswordSchema, {
        email: {
          _errors: ["Incorrect email or password"],
        },
      })
    }

    const isValidPassword = await verifyPassword(existingUser.id, password)

    if (!isValidPassword) {
      returnValidationErrors(SignInWithPasswordSchema, {
        password: {
          _errors: ["Incorrect email or password"],
        },
      })
    }

    await createActivityLog("signed_in_with_password", {
      userId: existingUser.id,
    })

    await setSession(existingUser.id)

    redirect(AUTHORIZED_URL)
  })

export const signInWithCode = actionClient
  .metadata({ actionName: "auth/signInWithCode" })
  .use(withRateLimitByIp)
  .schema(SignInWithCodeSchema)
  .action(async ({ parsedInput }) => {
    if (!env.AUTH_SIGN_IN_CODES) {
      throw new Error("Sign-in codes are disabled")
    }

    const { email } = parsedInput

    await sendSignInCode(email)

    await createActivityLog("requested_sign_in_code")

    const cookieStore = await cookies()
    cookieStore.set(VERIFICATION_EMAIL_COOKIE_NAME, email, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 60 * 10, // Ten minutes
      path: "/",
    })

    redirect("/sign-in/code")
  })

export const checkSignInCode = actionClient
  .metadata({ actionName: "auth/checkSignInCode" })
  .use(withRateLimitByIp)
  .schema(CheckSignInWithCodeSchema)
  .action(async ({ parsedInput }) => {
    if (!env.AUTH_SIGN_IN_CODES) {
      throw new Error("Sign-in codes are disabled")
    }

    const cookieStore = await cookies()
    const email = cookieStore.get(VERIFICATION_EMAIL_COOKIE_NAME)?.value ?? null

    if (!email) {
      return redirect(UNAUTHORIZED_URL)
    }

    const { code } = parsedInput

    const isValidCode = await verifySignInCode(email, code)

    if (!isValidCode) {
      returnValidationErrors(CheckSignInWithCodeSchema, {
        code: {
          _errors: ["Invalid code"],
        },
      })
    }

    cookieStore.set(VERIFICATION_EMAIL_COOKIE_NAME, "")

    let user = await findUserByEmail(email)

    if (!user) {
      user = await createUser({ email })

      await createProfile(user.id)

      await createActivityLog("signed_up_with_code", { userId: user.id })

      await createOrganization(
        { name: DEFAULT_ORGANIZATION_NAME },
        { ownerId: user.id },
      )

      await markUserAsEmailVerified(user.id)
    } else {
      await markUserAsEmailVerified(user.id)

      await createActivityLog("signed_in_with_code", { userId: user.id })
    }

    await setSession(user.id)

    redirect(AUTHORIZED_URL)
  })

export const checkEmailVerificationCode = authActionClient
  .metadata({ actionName: "auth/checkEmailVerificationCode" })
  .use(withRateLimitByUser)
  .schema(CheckEmailVerificationCodeSchema)
  .action(async ({ parsedInput: { code }, ctx: { user } }) => {
    const isValidCode = await verifyEmailVerificationCode(user.id, code)

    if (!isValidCode) {
      returnValidationErrors(CheckEmailVerificationCodeSchema, {
        code: {
          _errors: ["Invalid code"],
        },
      })
    }

    redirect(AUTHORIZED_URL)
  })

export const requestPasswordReset = actionClient
  .metadata({ actionName: "auth/requestPasswordReset" })
  .use(withRateLimitByIp)
  .schema(RequestPasswordResetSchema)
  .action(async ({ parsedInput: { email } }) => {
    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      await sendPasswordResetToken(existingUser.id, existingUser.email)

      await createActivityLog("requested_password_reset", {
        userId: existingUser.id,
      })
    }

    redirect(`${RESET_PASSWORD_URL}/confirm?to=${email}`)
  })

export const resetPassword = actionClient
  .metadata({ actionName: "auth/resetPassword" })
  .use(withRateLimitByIp)
  .schema(NewPasswordSchema)
  .bindArgsSchemas([z.string().min(1)])
  .action(
    async ({ parsedInput: { password }, bindArgsParsedInputs: [token] }) => {
      const passwordResetToken = await findValidPasswordResetToken(token)

      if (!passwordResetToken) {
        throw new PasswordResetError("Your token has expired or is invalid")
      }

      await invalidateUserSessions(passwordResetToken.userId)

      await createPassword(passwordResetToken.userId, password)
      await markPasswordResetTokenAsUsed(passwordResetToken.userId)

      await createActivityLog("reset_password", {
        userId: passwordResetToken.userId,
      })

      await setSession(passwordResetToken.userId)

      redirect(AUTHORIZED_URL, RedirectType.replace)
    },
  )

export const signOut = authActionClient
  .metadata({ actionName: "auth/signOut" })
  .action(async ({ ctx }) => {
    await createActivityLog("signed_out", { userId: ctx.user.id })
    await invalidateSession(ctx.session.id)
    redirect(UNAUTHORIZED_URL)
  })

export const resendSignInCode = actionClient
  .metadata({ actionName: "auth/resendSignInCode" })
  .use(withRateLimitByIp)
  .schema(z.object({ email: z.string().email() }))
  .action(async ({ parsedInput }) => {
    await sendSignInCode(parsedInput.email)
  })

export const resendEmailVerificationCode = authActionClient
  .metadata({ actionName: "auth/resendEmailVerificationCode" })
  .use(withRateLimitByUser)
  .action(async ({ ctx }) => {
    await sendEmailVerificationCode(ctx.user.id, ctx.user.email)
    await createActivityLog("requested_email_verification", {
      userId: ctx.user.id,
    })
  })
