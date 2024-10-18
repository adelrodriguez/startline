"use server"

import { parseWithZod } from "@conform-to/zod"
import { cookies } from "next/headers"
import { RedirectType, redirect } from "next/navigation"
import { z } from "zod"
import {
  getCurrentSession,
  invalidateAllSessions,
  invalidateSession,
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
import { logActivity } from "~/lib/logger"
import { rateLimitByIp, rateLimitByUser } from "~/lib/rate-limit"
import {
  actionClient,
  authActionClient,
  withRateLimitByIp,
  withRateLimitByUser,
} from "~/lib/safe-action"
import {
  createCheckEmailVerificationCodeSchema,
  createCheckInWithCodeSchema,
  createNewPasswordSchema,
  createRequestPasswordResetSchema,
  createSignInWithCodeSchema,
  createSignInWithPasswordSchema,
  createSignUpSchema,
} from "~/lib/validation/forms"
import { isProduction } from "~/lib/vars"
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

export async function signUp(_: unknown, formData: FormData) {
  if (!env.AUTH_PASSWORD) {
    throw new Error("Password authentication is disabled")
  }

  await rateLimitByIp()

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      createSignUpSchema(intent, {
        async checkIsEmailUnique(email) {
          const existingUser = await findUserByEmail(email)

          return existingUser === null
        },
      }),
    async: true,
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  const newUser = await createUser({ email: submission.value.email })

  await createProfile(newUser.id)
  await createPassword(newUser.id, submission.value.password)
  await sendEmailVerificationCode(newUser.id, newUser.email)

  await logActivity("signed_up_with_password", { userId: newUser.id })

  const newOrganization = await createOrganization(
    { name: DEFAULT_ORGANIZATION_NAME },
    { ownerId: newUser.id },
  )

  await logActivity("created_organization", {
    userId: newUser.id,
    organizationId: newOrganization.id,
  })

  await setSession(newUser.id)

  redirect(AUTHORIZED_URL)
}

export async function signInWithPassword(_: unknown, formData: FormData) {
  if (!env.AUTH_PASSWORD) {
    throw new Error("Password authentication is disabled")
  }

  const submission = parseWithZod(formData, {
    schema: createSignInWithPasswordSchema(),
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  await rateLimitByIp()

  const existingUser = await findUserByEmail(submission.value.email)

  if (!existingUser) {
    return submission.reply({
      formErrors: ["Incorrect email or password"],
    })
  }

  const isValidPassword = await verifyPassword(
    existingUser.id,
    submission.value.password,
  )

  if (!isValidPassword) {
    return submission.reply({
      formErrors: ["Incorrect email or password"],
    })
  }

  await logActivity("signed_in_with_password", { userId: existingUser.id })

  await setSession(existingUser.id)

  redirect(AUTHORIZED_URL)
}

export async function signInWithCode(_: unknown, formData: FormData) {
  if (!env.AUTH_SIGN_IN_CODES) {
    throw new Error("Sign-in codes are disabled")
  }

  const submission = parseWithZod(formData, {
    schema: createSignInWithCodeSchema(),
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  await rateLimitByIp()

  await sendSignInCode(submission.value.email)

  await logActivity("requested_sign_in_code")

  const cookieStore = cookies()
  cookieStore.set(VERIFICATION_EMAIL_COOKIE_NAME, submission.value.email, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 60 * 10, // Ten minutes
  })

  redirect("/sign-in/code")
}

export async function checkSignInCode(_: unknown, formData: FormData) {
  if (!env.AUTH_SIGN_IN_CODES) {
    throw new Error("Sign-in codes are disabled")
  }

  const cookieStore = cookies()
  const email = cookieStore.get(VERIFICATION_EMAIL_COOKIE_NAME)?.value ?? null

  if (!email) {
    return redirect(UNAUTHORIZED_URL)
  }

  const submission = parseWithZod(formData, {
    schema: createCheckInWithCodeSchema(),
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  await rateLimitByIp()

  const isValidCode = await verifySignInCode(email, submission.value.code)

  if (!isValidCode) {
    return submission.reply({
      fieldErrors: { code: ["Invalid code"] },
    })
  }

  cookieStore.set(VERIFICATION_EMAIL_COOKIE_NAME, "")

  let user = await findUserByEmail(email)

  if (!user) {
    user = await createUser({ email })

    await createProfile(user.id)

    await logActivity("signed_up_with_code", { userId: user.id })

    await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: user.id },
    )

    await markUserAsEmailVerified(user.id)
  } else {
    await markUserAsEmailVerified(user.id)

    await logActivity("signed_in_with_code", { userId: user.id })
  }

  await setSession(user.id)

  redirect(AUTHORIZED_URL)
}

export async function checkEmailVerificationCode(
  _: unknown,
  formData: FormData,
) {
  const { user } = await getCurrentSession()

  if (!user) {
    return redirect(UNAUTHORIZED_URL)
  }

  const submission = parseWithZod(formData, {
    schema: createCheckEmailVerificationCodeSchema(),
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  await rateLimitByUser(user.email)

  const isValidCode = await verifyEmailVerificationCode(
    user.id,
    submission.value.code,
  )

  if (!isValidCode) {
    return submission.reply({
      formErrors: ["Invalid code"],
    })
  }

  redirect(AUTHORIZED_URL)
}

export async function requestPasswordReset(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createRequestPasswordResetSchema(),
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  await rateLimitByIp()

  const existingUser = await findUserByEmail(submission.value.email)

  if (existingUser) {
    await sendPasswordResetToken(existingUser.id, existingUser.email)
    await logActivity("requested_password_reset", { userId: existingUser.id })
  }

  redirect(`${RESET_PASSWORD_URL}/confirm?to=${submission.value.email}`)
}

export async function resetPassword(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createNewPasswordSchema(),
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  await rateLimitByIp()

  const passwordResetToken = await findValidPasswordResetToken(
    submission.value.token,
  )

  if (!passwordResetToken) {
    throw new PasswordResetError("Your token has expired or is invalid")
  }

  // Log the user out of all sessions
  await invalidateAllSessions(passwordResetToken.userId)

  await Promise.all([
    createPassword(passwordResetToken.userId, submission.value.password),
    markPasswordResetTokenAsUsed(passwordResetToken.userId),
  ])

  await logActivity("reset_password", { userId: passwordResetToken.userId })

  await setSession(passwordResetToken.userId)

  redirect(AUTHORIZED_URL, RedirectType.replace)
}

export const signOut = authActionClient.action(async ({ ctx }) => {
  await logActivity("signed_out", { userId: ctx.user.id })
  await invalidateSession(ctx.session.id)
  redirect(UNAUTHORIZED_URL)
})

export const resendSignInCode = actionClient
  .use(withRateLimitByIp)
  .schema(z.object({ email: z.string().email() }))
  .action(async ({ parsedInput }) => {
    await sendSignInCode(parsedInput.email)
  })

export const resendEmailVerificationCode = authActionClient
  .use(withRateLimitByUser)
  .action(async ({ ctx }) => {
    await sendEmailVerificationCode(ctx.user.id, ctx.user.email)
  })
