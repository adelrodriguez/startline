import "server-only"

import { addDays, addHours, addMinutes } from "date-fns"
import { generateIdFromEntropySize } from "lucia"
import { alphabet, generateRandomString } from "oslo/crypto"
import { z } from "zod"

import {
  EmailVerificationCodeEmail,
  PasswordResetTokenEmail,
  SignInCodeEmail,
} from "~/components/emails"
import { SESSION_LENGTH_IN_DAYS } from "~/lib/consts"
import { sendEmail } from "~/lib/emails"
import { logActivity } from "~/lib/logger"
import db, {
  emailVerificationCode,
  filters,
  password,
  passwordResetToken,
  profile,
  session,
  signInCode,
  user,
} from "~/server/db"
import { DatabaseError, UnauthorizedError } from "~/utils/error"
import { argon2, sha } from "~/utils/hash"
import type { StrictOmit } from "~/utils/type"

export type User = typeof user.$inferSelect
export type UserRole = User["role"]
export type NewUser = typeof user.$inferInsert

export const UserId = z.bigint().brand<"UserId">()
export type UserId = z.infer<typeof UserId>

export const UserPublicId = z.string().brand<"UserPublicId">()
export type UserPublicId = z.infer<typeof UserPublicId>

export type Password = typeof password.$inferSelect
export type NewPassword = typeof password.$inferInsert

export type PasswordResetToken = typeof passwordResetToken.$inferSelect
export type NewPasswordResetToken = typeof passwordResetToken.$inferInsert

export type Profile = typeof profile.$inferSelect
export type NewProfile = typeof profile.$inferInsert

export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert

export const SessionId = z.string().brand<"SessionId">()
export type SessionId = z.infer<typeof SessionId>

export const SessionPublicId = z.string().brand<"SessionPublicId">()
export type SessionPublicId = z.infer<typeof SessionPublicId>

export type EmailVerificationCode = typeof emailVerificationCode.$inferSelect
export type NewEmailVerificationCode = typeof emailVerificationCode.$inferInsert

export const EmailVerificationCodeId = z
  .string()
  .brand<"EmailVerificationCodeId">()
export type EmailVerificationCodeId = z.infer<typeof EmailVerificationCodeId>

export async function findUserByEmail(
  email: User["email"],
): Promise<User | null> {
  const existingUser = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.email, email),
  })

  return existingUser ?? null
}

export async function findUserByGoogleId(
  googleId: string,
): Promise<User | null> {
  const existingUser = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.googleId, googleId),
  })

  return existingUser ?? null
}

export async function findUserByGitHubId(
  githubId: string,
): Promise<User | null> {
  const existingUser = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.githubId, githubId),
  })

  return existingUser ?? null
}

export async function findUserById(userId: UserId): Promise<User | null> {
  const user = await db.query.user.findFirst({
    where: (model, { eq }) => eq(model.id, userId),
  })

  return user ?? null
}

export async function createUser(values: NewUser): Promise<User> {
  const [newUser] = await db
    .insert(user)
    .values({ ...values, role: "user" })
    .returning()

  if (!newUser) {
    throw new DatabaseError("Failed to create user")
  }

  return newUser
}

export async function createUserFromGoogle(
  values: Pick<NewUser, "email" | "googleId">,
): Promise<User> {
  const [newUser] = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .onConflictDoUpdate({
      target: user.email,
      set: { emailVerifiedAt: new Date(), googleId: values.googleId },
    })
    .returning()

  if (!newUser) {
    throw new DatabaseError("Failed to create user from Google")
  }

  await logActivity("signed_up_with_google", {
    userId: UserId.parse(newUser.id),
  })

  return newUser
}

export async function createUserFromGitHub(
  values: Pick<NewUser, "email" | "githubId">,
): Promise<User> {
  const [newUser] = await db
    .insert(user)
    .values({ ...values, role: "user", emailVerifiedAt: new Date() })
    .onConflictDoUpdate({
      target: user.email,
      set: { emailVerifiedAt: new Date(), githubId: values.githubId },
    })
    .returning()

  if (!newUser) {
    throw new DatabaseError("Failed to create user from GitHub")
  }

  await logActivity("signed_up_with_github", {
    userId: UserId.parse(newUser.id),
  })

  return newUser
}

export async function findOrCreateUser(
  values: Pick<NewUser, "email">,
): Promise<User> {
  const [newUser] = await db
    .insert(user)
    .values({ ...values, role: "user" })
    .onConflictDoNothing()
    .returning()

  if (!newUser) {
    throw new DatabaseError("Failed to find or create user")
  }

  return newUser
}

export async function markUserAsEmailVerified(userId: UserId): Promise<void> {
  await db
    .update(user)
    .set({ emailVerifiedAt: new Date() })
    .where(
      filters.and(
        filters.eq(user.id, userId),
        filters.isNull(user.emailVerifiedAt),
      ),
    )

  await logActivity("marked_email_as_verified", { userId })
}

export function assertUserIsAdmin(
  user: User,
): asserts user is User & { role: "admin" } {
  if (user.role !== "admin") {
    throw new UnauthorizedError("User is not an admin")
  }
}

export function assertUserIsUser(
  user: User,
): asserts user is User & { role: "user" } {
  if (user.role !== "user") {
    throw new UnauthorizedError("User is not a user")
  }
}

export async function createProfile(
  userId: UserId,
  values: StrictOmit<NewProfile, "userId"> = {},
): Promise<Profile> {
  const [newProfile] = await db
    .insert(profile)
    .values({ ...values, userId })
    .onConflictDoNothing()
    .returning()

  if (!newProfile) {
    throw new DatabaseError("Failed to create profile")
  }

  return newProfile
}

export async function findValidEmailVerificationCodeByUserId(
  userId: UserId,
): Promise<EmailVerificationCode | null> {
  const code = await db.query.emailVerificationCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.userId, userId), gte(model.expiresAt, new Date())),
  })

  return code ?? null
}

export async function sendEmailVerificationCode(
  userId: UserId,
  email: string,
): Promise<void> {
  // Delete old codes
  await deleteEmailVerificationCodes(userId)

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await db
    .insert(emailVerificationCode)
    .values({
      hash: await sha.sha256.hash(code),
      userId,
      expiresAt: addHours(new Date(), 24),
    })
    .returning()

  await sendEmail(
    email,
    "Verify your email",
    EmailVerificationCodeEmail({ code }),
  )

  await logActivity("requested_email_verification", { userId })
}

export async function verifyEmailVerificationCode(
  userId: UserId,
  code: string,
): Promise<boolean> {
  const emailVerificationCode =
    await findValidEmailVerificationCodeByUserId(userId)

  if (!emailVerificationCode) return false

  const isValidCode = await sha.sha256.verify(emailVerificationCode.hash, code)

  if (!isValidCode) return false

  await deleteEmailVerificationCodes(userId)
  await markUserAsEmailVerified(userId)

  return true
}

export async function deleteEmailVerificationCodes(
  userId: UserId,
): Promise<number | null> {
  const result = await db
    .delete(emailVerificationCode)
    .where(filters.eq(emailVerificationCode.userId, userId))

  return result.rowCount
}

export async function cleanExpiredEmailVerificationCodes(): Promise<
  number | null
> {
  const result = await db
    .delete(emailVerificationCode)
    .where(filters.lt(emailVerificationCode.expiresAt, new Date()))

  return result.rowCount
}

export async function findValidPasswordResetToken(
  input: string,
): Promise<PasswordResetToken | null> {
  const hashed = await sha.sha256.hash(input)

  const token = await db.query.passwordResetToken.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.hash, hashed), gte(model.expiresAt, new Date())),
  })

  return token ?? null
}

export async function sendPasswordResetToken(
  userId: UserId,
  email: string,
): Promise<void> {
  await deletePasswordResetTokens(userId)

  const token = generateIdFromEntropySize(25)

  await db.insert(passwordResetToken).values({
    userId,
    hash: await sha.sha256.hash(token),
    expiresAt: addHours(new Date(), 24),
  })

  await sendEmail(
    email,
    "Reset your password",
    PasswordResetTokenEmail({ token }),
  )

  await logActivity("requested_password_reset", { userId })
}

export async function markPasswordResetTokenAsUsed(
  userId: UserId,
): Promise<void> {
  await deletePasswordResetTokens(userId)

  await logActivity("reset_password", { userId })

  // If the user received received the password reset token and it was verified,
  // we can mark the user as verified.
  await markUserAsEmailVerified(userId)
}

export async function deletePasswordResetTokens(userId: UserId): Promise<void> {
  await db
    .delete(passwordResetToken)
    .where(filters.eq(passwordResetToken.userId, userId))
    .returning()
}

export async function cleanExpiredPasswordResetTokens(): Promise<
  number | null
> {
  const result = await db
    .delete(passwordResetToken)
    .where(filters.lt(passwordResetToken.expiresAt, new Date()))

  return result.rowCount
}

export async function createPassword(
  userId: UserId,
  input: string,
): Promise<Password> {
  const hashedPassword = await argon2.hash(input)

  const [newPassword] = await db
    .insert(password)
    .values({ hash: hashedPassword, userId })
    .onConflictDoUpdate({
      target: password.userId,
      set: { hash: hashedPassword },
    })
    .returning()

  if (!newPassword) {
    throw new DatabaseError("Failed to create password")
  }

  return newPassword
}

export async function findPassword(userId: UserId): Promise<Password | null> {
  const password = await db.query.password.findFirst({
    where: (model, { eq }) => eq(model.userId, userId),
  })

  return password ?? null
}

export async function verifyPassword(
  userId: UserId,
  input: string,
): Promise<boolean> {
  const password = await findPassword(userId)

  if (!password) {
    return false
  }

  return argon2.verify(password.hash, input)
}

export async function sendSignInCode(email: string): Promise<void> {
  // Delete old codes
  await deleteSignInCode(email)

  const code = await generateRandomString(6, alphabet("0-9", "A-Z"))

  await db.insert(signInCode).values({
    email,
    hash: await sha.sha256.hash(code),
    expiresAt: addMinutes(new Date(), 15),
  })

  await sendEmail(email, "Sign in code", SignInCodeEmail({ code }))

  await logActivity("requested_sign_in_code")
}

export async function verifySignInCode(
  email: string,
  code: string,
): Promise<boolean> {
  const signInCode = await db.query.signInCode.findFirst({
    where: (model, { eq, and, gte }) =>
      and(eq(model.email, email), gte(model.expiresAt, new Date())),
  })

  if (!signInCode) return false

  const isValidCode = sha.sha256.verify(signInCode.hash, code)

  if (!isValidCode) return false

  // Delete the verified code
  await deleteSignInCode(email)

  return true
}

export async function deleteSignInCode(email: string): Promise<void> {
  await db
    .delete(signInCode)
    .where(filters.eq(signInCode.email, email))
    .returning()
}

export async function cleanExpiredSignInCodes(): Promise<number | null> {
  const result = await db
    .delete(signInCode)
    .where(filters.lt(signInCode.expiresAt, new Date()))

  return result.rowCount
}

export async function createSession(
  token: string,
  userId: UserId,
  values: Omit<NewSession, "id" | "userId" | "expiresAt">,
): Promise<Session> {
  const [newSession] = await db
    .insert(session)
    .values({
      ...values,
      userId,
      id: SessionId.parse(sha.sha256.hash(token)),
      expiresAt: addDays(new Date(), SESSION_LENGTH_IN_DAYS),
    })
    .returning()

  if (!newSession) {
    throw new DatabaseError("Failed to create session")
  }

  return newSession
}

export async function findSessionById(
  sessionId: SessionId,
): Promise<(Session & { user: User }) | null> {
  const existingSession = await db.query.session.findFirst({
    where: filters.eq(session.id, sessionId),
    with: {
      user: true,
    },
  })

  return existingSession ?? null
}

export async function deleteSession(sessionId: SessionId): Promise<void> {
  await db.delete(session).where(filters.eq(session.id, sessionId))
}

export async function deleteSessions(userId: UserId): Promise<void> {
  await db.delete(session).where(filters.eq(session.userId, userId))
}

export async function updateSession(
  sessionId: SessionId,
  values: Partial<Omit<NewSession, "id" | "userId">>,
): Promise<void> {
  await db.update(session).set(values).where(filters.eq(session.id, sessionId))
}
