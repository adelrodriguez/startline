import { z } from "zod"

export * from "./auth"

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "admin"]),
  organizationId: z.number(),
})
