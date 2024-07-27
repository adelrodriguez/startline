import { z } from "zod"

export const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const SignInWithPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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

export const GoogleUserSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean(),
  picture: z.string().optional(),
})

export const GitHubUserSchema = z.object({
  id: z.coerce.string().min(1),
  email: z.string().email(),
  avatar_url: z.string().optional(),
  name: z.string().optional(),
})
