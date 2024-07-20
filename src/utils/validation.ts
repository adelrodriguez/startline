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

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const GoogleUserSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean(),
  picture: z.string().optional(),
})
