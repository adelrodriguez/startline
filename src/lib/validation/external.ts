import { z } from "zod"
import { LOCALES, type Locale } from "~/lib/consts"

export const GoogleUserSchema = z.object({
  sub: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean(),
  picture: z.string().url().optional(),
  locale: z.preprocess(
    (v) => (LOCALES.includes(v as Locale) ? v : undefined),
    z.enum(LOCALES).optional()
  ),
})
export type GoogleUser = z.infer<typeof GoogleUserSchema>

export const GitHubUserSchema = z.object({
  id: z.coerce.string().min(1),
  email: z.string().email(),
  avatar_url: z.string().optional(),
  name: z.string().optional(),
})
export type GitHubUser = z.infer<typeof GitHubUserSchema>
