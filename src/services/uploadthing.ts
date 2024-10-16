import {
  type FileRouter as UploadThingFileRouter,
  createUploadthing,
} from "uploadthing/next"
import { UTApi, UploadThingError } from "uploadthing/server"

import { getCurrentSession } from "~/lib/auth/session"
import { rateLimitByUser } from "~/lib/rate-limit"
import type { AssetMimeType } from "~/server/data/asset"
import { createAsset } from "~/server/data/asset"
import { UserId } from "~/server/data/user"

export const utapi = new UTApi()

const router = createUploadthing()

export const fileRouter = {
  imageUploader: router({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { user } = await getCurrentSession()

      if (!user) throw new UploadThingError("Unauthorized")

      await rateLimitByUser(user.email)

      return { userId: UserId.parse(user.id).toString() }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const userId = UserId.parse(BigInt(metadata.userId))

      await createAsset(userId, {
        service: "uploadthing",
        mimeType: file.type as AssetMimeType,
        filename: file.name,
        size: file.size,
        url: file.url,
      })

      return { uploadedBy: metadata.userId }
    }),
} satisfies UploadThingFileRouter

export type FileRouter = typeof fileRouter
