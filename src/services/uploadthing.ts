import {
  type FileRouter as UploadThingFileRouter,
  createUploadthing,
} from "uploadthing/next"
import { UTApi, UploadThingError } from "uploadthing/server"

import { validateRequest } from "~/lib/auth/session"
import { logActivity } from "~/lib/logger"
import { rateLimitByUser } from "~/lib/rate-limit"
import type { AssetMimeType } from "~/server/data/asset"
import { createAsset } from "~/server/data/asset"
import type { UserId } from "~/server/data/user"

export const utapi = new UTApi()

const router = createUploadthing()

export const fileRouter = {
  imageUploader: router({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const { user } = await validateRequest()

      if (!user) throw new UploadThingError("Unauthorized")

      await rateLimitByUser(user.email)

      return { userId: user.id.toString() }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const userId = BigInt(metadata.userId) as UserId

      const asset = await createAsset(userId, {
        service: "uploadthing",
        mimeType: file.type as AssetMimeType,
        filename: file.name,
        size: file.size,
        url: file.url,
        status: "uploaded",
      })

      await logActivity("created_asset", { userId })

      return { uploadedBy: metadata.userId, publicId: asset.publicId }
    }),
} satisfies UploadThingFileRouter

export type FileRouter = typeof fileRouter
