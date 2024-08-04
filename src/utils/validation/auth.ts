import type { Intent } from "@conform-to/react"
import { conformZodMessage } from "@conform-to/zod"
import { z } from "zod"

const PasswordSchema = z.string().min(8)

const matchPasswords = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword

export function createSignUpSchema(
  intent: Intent | null,
  options?: {
    checkIsEmailUnique: (email: string) => Promise<boolean>
  },
) {
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
                code: "custom",
                message: conformZodMessage.VALIDATION_SKIPPED,
              })

              return
            }

            if (typeof options?.checkIsEmailUnique !== "function") {
              ctx.addIssue({
                code: "custom",
                message: conformZodMessage.VALIDATION_UNDEFINED,
                fatal: true,
              })

              return
            }

            return options.checkIsEmailUnique(email).then((isEmailUnique) => {
              if (isEmailUnique) return

              ctx.addIssue({
                code: "custom",
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

export const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const SignInWithPasswordSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
})

export const SignInWithCodeSchema = z.object({
  email: z.string().email(),
})

export const CheckSignInCodeSchema = z.object({
  code: z.string().length(6),
})

export const CheckEmailVerificationCodeSchema = z.object({
  code: z.string().length(6),
})

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
})

export const NewPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
