import type { Intent } from "@conform-to/react"
import { conformZodMessage } from "@conform-to/zod"
import { z } from "zod"

const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(1, "Password is required")
  .min(8, "Password must be more than 8 characters")
  .max(32, "Password must be less than 32 characters")

const CodeSchema = z
  .string()
  .length(6)
  .transform((code) => code.toUpperCase())

const matchPasswords = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword

export function createSignUpSchema(
  intent: Intent | null,
  options?: {
    checkIsEmailUnique: (email: string) => Promise<boolean>
  },
) {
  // TODO(adelrodriguez): Fix this validation so we don't trigger the submission
  // loading state. Another benefit of fixing this is that we can debounce the
  // email validation.
  return z
    .object({
      email: z
        .string()
        .email()
        .pipe(
          z.string().superRefine((email, ctx) => {
            const isValidatingEmail =
              intent === null ||
              (intent.type === "validate" && intent.payload.name === "email")

            // This make Conform to use the previous result instead by
            // indicating that the validation is skipped
            if (!isValidatingEmail) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: conformZodMessage.VALIDATION_SKIPPED,
              })

              return
            }

            if (typeof options?.checkIsEmailUnique !== "function") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: conformZodMessage.VALIDATION_UNDEFINED,
                fatal: true,
              })

              return
            }

            return options.checkIsEmailUnique(email).then((isEmailUnique) => {
              if (isEmailUnique) return

              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is already used",
              })
            })
          }),
        ),
      password: PasswordSchema,
      confirmPassword: PasswordSchema,
    })
    .refine(matchPasswords, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
}

export function createSignInWithPasswordSchema() {
  return z.object({
    email: z.string().email(),
    password: PasswordSchema,
  })
}

export function createSignInWithCodeSchema() {
  return z.object({
    email: z.string().email(),
  })
}

export function createCheckInWithCodeSchema() {
  return z.object({
    code: CodeSchema,
  })
}

export function createCheckEmailVerificationCodeSchema() {
  return z.object({
    code: CodeSchema,
  })
}

export function createRequestPasswordResetSchema() {
  return z.object({
    email: z.string().email(),
  })
}

export function createNewPasswordSchema() {
  return z
    .object({
      token: z.string().min(1),
      password: PasswordSchema,
      confirmPassword: PasswordSchema,
    })
    .refine(matchPasswords, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
}

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
})
