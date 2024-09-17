import { z } from "zod"
import { OrganizationId } from "~/server/data/organization"
import { MIME_TYPES } from "~/lib/consts"

export * from "./auth"
export * from "./jobs"

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "admin"]),
  organizationId: OrganizationId,
})

export const UploadFileRequestSchema = z.object({
  filename: z.string(),
  mimeType: z.enum(MIME_TYPES, { message: "Invalid file type" }),
  size: z.number(),
})

export const ConfirmUploadRequestSchema = z.object({
  assetId: z.number(),
})
