"use server"

import { parseWithZod } from "@conform-to/zod"
import { cookies } from "next/headers"
import { RedirectType, redirect } from "next/navigation"
import { z } from "zod"
import {
  invalidateAllSessions,
  invalidateSession,
  setSession,
  validateRequest,
} from "~/lib/auth"
import {
  AUTHORIZED_URL,
  DEFAULT_ORGANIZATION_NAME,
  RESET_PASSWORD_URL,
  UNAUTHORIZED_URL,
} from "~/lib/consts"
import env from "~/lib/env.server"
import { logActivity } from "~/lib/logger"
import { rateLimitByIp, rateLimitByUser } from "~/lib/rate-limit"
import {
  actionClient,
  authActionClient,
  withRateLimitByIp,
  withUserId,
} from "~/lib/safe-action"
import {
  RequestPasswordResetSchema,
  createCheckEmailVerificationCodeSchema,
  createCheckInWithCodeSchema,
  createNewPasswordSchema,
  createSignInWithCodeSchema,
  createSignInWithPasswordSchema,
  createSignUpSchema,
} from "~/lib/validation/forms"
import { isProduction } from "~/lib/vars"
import { createOrganization } from "~/server/data/organization"
import {
  UserId,
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
import { PasswordResetError } from "~/utils/error"
import { getIpAddress } from "~/utils/headers"

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

  const userId = UserId.parse(newUser.id)

  await createProfile(userId)
  await createPassword(userId, submission.value.password)
  await sendEmailVerificationCode(userId, newUser.email)

  await logActivity("signed_up_with_password", { userId })

  await createOrganization(
    { name: DEFAULT_ORGANIZATION_NAME },
    { ownerId: userId },
  )

  await setSession(userId, { ipAddress: getIpAddress() })

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

  const userId = UserId.parse(existingUser.id)

  const isValidPassword = await verifyPassword(
    userId,
    submission.value.password,
  )

  if (!isValidPassword) {
    return submission.reply({
      formErrors: ["Incorrect email or password"],
    })
  }

  await logActivity("signed_in_with_password", { userId })

  await setSession(userId, { ipAddress: getIpAddress() })

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

  cookies().set(VERIFICATION_EMAIL_COOKIE_NAME, submission.value.email, {
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

  const email = cookies().get(VERIFICATION_EMAIL_COOKIE_NAME)?.value ?? null

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

  cookies().set(VERIFICATION_EMAIL_COOKIE_NAME, "")

  let user = await findUserByEmail(email)
  let userId: UserId

  if (!user) {
    user = await createUser({ email })

    userId = UserId.parse(user.id)

    await createProfile(userId)

    await logActivity("signed_up_with_code", { userId })

    await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: userId },
    )

    await markUserAsEmailVerified(userId)
  } else {
    userId = UserId.parse(user.id)

    await markUserAsEmailVerified(userId)

    await logActivity("signed_in_with_code", { userId })
  }

  await setSession(userId, { ipAddress: getIpAddress() })

  redirect(AUTHORIZED_URL)
}

export async function checkEmailVerificationCode(
  _: unknown,
  formData: FormData,
) {
  const { user } = await validateRequest()

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

  const userId = UserId.parse(user.id)

  const isValidCode = await verifyEmailVerificationCode(
    userId,
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
    schema: RequestPasswordResetSchema,
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  await rateLimitByIp()

  const existingUser = await findUserByEmail(submission.value.email)

  if (existingUser) {
    const userId = UserId.parse(existingUser.id)

    await sendPasswordResetToken(userId, existingUser.email)
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

  const userId = UserId.parse(passwordResetToken.userId)

  // Log the user out of all sessions
  await invalidateAllSessions(userId)

  await Promise.all([
    createPassword(userId, submission.value.password),
    markPasswordResetTokenAsUsed(userId),
  ])

  await setSession(userId, { ipAddress: getIpAddress() })

  redirect(AUTHORIZED_URL, RedirectType.replace)
}

export const signOut = authActionClient
  .use(withUserId)
  .action(async ({ ctx }) => {
    await logActivity("signed_out", { userId: ctx.userId })
    await invalidateSession(ctx.session)
  })

export const resendSignInCode = actionClient
  .use(withRateLimitByIp)
  .schema(z.object({ email: z.string().email() }))
  .action(async ({ parsedInput }) => {
    await sendSignInCode(parsedInput.email)
  })

export const resendEmailVerificationCode = authActionClient
  .use(withUserId)
  .use(withRateLimitByIp)
  .action(async ({ ctx }) => {
    await sendEmailVerificationCode(ctx.userId, ctx.user.email)
  })
