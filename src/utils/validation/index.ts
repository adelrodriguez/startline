import { z } from "zod"

export * from "./auth"

export const GoogleUserSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean(),
  picture: z.string().url().optional(),
})

export const GitHubUserSchema = z.object({
  id: z.coerce.string().min(1),
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
  name: z.string().optional(),
})
