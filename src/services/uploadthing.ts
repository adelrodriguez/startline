import {
  type FileRouter as UploadThingFileRouter,
  createUploadthing,
} from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { UTApi } from "uploadthing/server"
import { validateRequest } from "~/lib/auth"
import rateLimiter from "~/lib/rate-limit"
import { createAsset } from "~/server/data/asset"
import { createUserId } from "~/server/data/user"
import { RateLimitError } from "~/utils/error"

export const utapi = new UTApi()

const router = createUploadthing()

export const fileRouter = {
  imageUploader: router({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const { user } = await validateRequest()

      if (!user) throw new UploadThingError("Unauthorized")

      const limit = await rateLimiter.user.limit(user.email)

      if (!limit.success) {
        throw new RateLimitError("Rate limit exceeded")
      }

      return { userId: createUserId(user.id) }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await createAsset(metadata.userId, {
        service: "uploadthing",
        mimeType: file.type,
        filename: file.name,
        size: file.size,
        url: file.url,
      })

      return { uploadedBy: metadata.userId }
    }),
} satisfies UploadThingFileRouter

export type FileRouter = typeof fileRouter
