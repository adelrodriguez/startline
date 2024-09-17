import { z } from "zod"

export const UploadFileRequestSchema = z.object({
  filename: z.string(),
  mimeType: z
    .string()
    .refine((value) => /^[a-z]+\/[a-z0-9\-+.]+$/i.test(value), {
      message: "Invalid MIME type format",
    }),
  size: z.number(),
})

export const ConfirmUploadRequestSchema = z.object({
  assetId: z.number(),
})
