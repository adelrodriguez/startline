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

export const SignUpSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const SignInWithCodeSchema = z.object({
  email: z.string().email(),
})

export const SignInWithPasswordSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
})

export const CheckSignInWithCodeSchema = z.object({
  code: CodeSchema,
})

export const CheckEmailVerificationCodeSchema = z.object({
  code: CodeSchema,
})

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
})

export const NewPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(matchPasswords, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const InviteMemberSchema = z.object({
  email: z.string().email(),
})
