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
} from "~/lib/consts"
import env from "~/lib/env.server"
import rateLimiter from "~/lib/rate-limit"
import {
  actionClient,
  authActionClient,
  rateLimitByIp,
} from "~/lib/safe-action"
import {
  RequestPasswordResetSchema,
  createCheckEmailVerificationCodeSchema,
  createCheckInWithCodeSchema,
  createNewPasswordSchema,
  createSignInWithCodeSchema,
  createSignInWithPasswordSchema,
  createSignUpSchema,
} from "~/lib/validation"
import { isProduction } from "~/lib/vars"
import {
  createPassword,
  createUser,
  createUserId,
  findOrCreateUserFromCode,
  findUserByEmail,
  findValidPasswordResetToken,
  markPasswordResetTokenAsUsed,
  sendEmailVerificationCode,
  sendPasswordResetToken,
  sendSignInCode,
  verifyEmailVerificationCode,
  verifyPassword,
  verifySignInCode,
} from "~/server/data"
import { PasswordResetError, RateLimitError } from "~/utils/error"
import { getIpAddress } from "~/utils/headers"

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

  const newUser = await createUser(
    { email: submission.value.email },
    { organization: true },
  )

  const userId = createUserId(newUser.id)

  await createPassword(userId, submission.value.password)

  await setSession(newUser.id, { ipAddress })

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

  const isValidPassword = await verifyPassword(
    createUserId(existingUser.id),
    submission.value.password,
  )

  if (!isValidPassword) {
    return submission.reply({
      formErrors: ["Incorrect email or password"],
    })
  }

  await setSession(existingUser.id, { ipAddress })

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

  // If the user already exists, we just update their emailVerifiedAt
  const user = await findOrCreateUserFromCode({ email }, { organization: true })

  await setSession(user.id, { ipAddress })

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

  const isValidCode = await verifyEmailVerificationCode(
    createUserId(user.id),
    submission.value.code,
  )

  if (!isValidCode) {
    return submission.reply({
      formErrors: ["Invalid code"],
    })
  }

  await redirect(AUTHORIZED_URL)
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
    return submission.reply({
      formErrors: ["Too many requests"],
    })
  }

  const existingUser = await findUserByEmail(submission.value.email)

  if (existingUser) {
    await sendPasswordResetToken(
      createUserId(existingUser.id),
      existingUser.email,
    )
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
    return submission.reply({
      formErrors: ["Too many requests"],
    })
  }

  const passwordResetToken = await findValidPasswordResetToken(
    submission.value.token,
  )

  if (!passwordResetToken) {
    throw new PasswordResetError("Your token has expired or is invalid")
  }

  const userId = createUserId(passwordResetToken.userId)

  // Log the user out of all sessions
  await invalidateAllSessions(userId)

  await createPassword(userId, submission.value.password)
  await markPasswordResetTokenAsUsed(userId)

  await setSession(userId, { ipAddress })

  redirect(AUTHORIZED_URL, RedirectType.replace)
}

export const signOut = authActionClient.action(async ({ ctx }) => {
  await invalidateSession(ctx.session)

  redirect(UNAUTHORIZED_URL)
})

export const resendSignInCode = actionClient
  .use(rateLimitByIp)
  .schema(z.object({ email: z.string().email() }))
  .action(async ({ parsedInput }) => {
    await sendSignInCode(parsedInput.email)
  })

export const resendEmailVerificationCode = authActionClient
  .use(rateLimitByIp)
  .action(({ ctx }) =>
    sendEmailVerificationCode(createUserId(ctx.user.id), ctx.user.email),
  )
