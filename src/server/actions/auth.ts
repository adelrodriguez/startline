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
  FALLBACK_IP,
  RESET_PASSWORD_URL,
  UNAUTHORIZED_URL,
  DEFAULT_ORGANIZATION_NAME,
} from "~/lib/consts"
import env from "~/lib/env.server"
import rateLimiter from "~/lib/rate-limit"
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
import {
  createPassword,
  createUser,
  createProfile,
  findUserByEmail,
  findValidPasswordResetToken,
  markPasswordResetTokenAsUsed,
  sendEmailVerificationCode,
  sendPasswordResetToken,
  sendSignInCode,
  verifyEmailVerificationCode,
  verifyPassword,
  verifySignInCode,
  UserId,
  markUserAsEmailVerified,
} from "~/server/data/user"
import { PasswordResetError, RateLimitError } from "~/utils/error"
import { getIpAddress } from "~/utils/headers"
import { createOrganization, OrganizationId } from "~/server/data/organization"
import { logActivity } from "~/lib/logger"

const VERIFICATION_EMAIL_COOKIE_NAME = "verification-email"

export async function signUp(_: unknown, formData: FormData) {
  if (!env.AUTH_PASSWORD) {
    throw new Error("Password authentication is disabled")
  }

  const ipAddress = getIpAddress() ?? FALLBACK_IP

  const limit = await rateLimiter.unknown.limit(ipAddress)

  if (!limit.success) {
    throw new RateLimitError("Too many requests")
  }

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

  await Promise.all([
    createProfile(userId),
    createPassword(userId, submission.value.password),
    sendEmailVerificationCode(userId, newUser.email),
    logActivity("signed_up_with_password", { userId }),
  ])

  const organization = await createOrganization(
    { name: DEFAULT_ORGANIZATION_NAME },
    { ownerId: userId },
  )

  const organizationId = OrganizationId.parse(organization.id)

  await logActivity("created_organization", { userId, organizationId })

  await setSession(userId, { ipAddress })

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

  const ipAddress = getIpAddress() ?? FALLBACK_IP

  const limit = await rateLimiter.unknown.limit(ipAddress)

  if (!limit.success) {
    throw new RateLimitError("Too many requests")
  }

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
  await setSession(userId, { ipAddress })

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

  const limit = await rateLimiter.unknown.limit(submission.value.email)

  if (!limit.success) {
    throw new RateLimitError("Too many requests")
  }

  await Promise.all([
    sendSignInCode(submission.value.email),
    logActivity("requested_sign_in_code"),
  ])

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

  const ipAddress = getIpAddress() ?? FALLBACK_IP

  const limit = await rateLimiter.unknown.limit(ipAddress)

  if (!limit.success) {
    throw new RateLimitError("Too many requests")
  }

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

    await Promise.all([
      createProfile(userId),
      logActivity("signed_up_with_code", { userId }),
    ])

    const organization = await createOrganization(
      { name: DEFAULT_ORGANIZATION_NAME },
      { ownerId: userId },
    )

    const organizationId = OrganizationId.parse(organization.id)

    await Promise.all([
      logActivity("created_organization", { userId, organizationId }),
    ])

    await Promise.all([
      markUserAsEmailVerified(userId),
      logActivity("marked_email_as_verified", { userId }),
    ])
  } else {
    userId = UserId.parse(user.id)

    await markUserAsEmailVerified(userId)

    await logActivity("signed_in_with_code", { userId })
  }

  await setSession(userId, { ipAddress })

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

  const limit = await rateLimiter.user.limit(user.email)

  if (!limit.success) {
    throw new RateLimitError("Too many requests")
  }

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

  await logActivity("verified_email", { userId })

  redirect(AUTHORIZED_URL)
}

export async function requestPasswordReset(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: RequestPasswordResetSchema,
  })

  if (submission.status !== "success") {
    return submission.reply()
  }

  const ipAddress = getIpAddress() ?? FALLBACK_IP

  const limit = await rateLimiter.unknown.limit(ipAddress)

  if (!limit.success) {
  }

  const existingUser = await findUserByEmail(submission.value.email)

  if (existingUser) {
    const userId = UserId.parse(existingUser.id)

    await Promise.all([
      sendPasswordResetToken(userId, existingUser.email),
      logActivity("requested_password_reset", { userId }),
    ])
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

  const ipAddress = getIpAddress() ?? FALLBACK_IP

  const limit = await rateLimiter.unknown.limit(ipAddress)

  if (!limit.success) {
    throw new RateLimitError("Too many requests")
  }

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
    logActivity("reset_password", { userId }),
  ])

  await setSession(userId, { ipAddress })

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
    await Promise.all([
      sendSignInCode(parsedInput.email),
      logActivity("requested_sign_in_code"),
    ])
  })

export const resendEmailVerificationCode = authActionClient
  .use(withUserId)
  .use(withRateLimitByIp)
  .action(async ({ ctx }) => {
    await Promise.all([
      sendEmailVerificationCode(ctx.userId, ctx.user.email),
      logActivity("requested_email_verification", { userId: ctx.userId }),
    ])
  })
