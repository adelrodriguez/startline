import { z } from "zod"

export * from "./auth"

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "admin"]),
  organizationId: z.number(),
})

export const UploadFileRequestSchema = z.object({
  filename: z.string(),
  mimeType: z
    .string()
    .refine(
      (mimeType) =>
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
          "text/plain",
          "application/pdf",
        ].includes(mimeType),
      { message: "Invalid file type" },
    ),
  size: z.number(),
})

export const ConfirmUploadRequestSchema = z.object({
  assetId: z.number(),
})
