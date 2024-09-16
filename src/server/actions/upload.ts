"use server"

import { StorageBuckets } from "~/lib/consts"
import { authActionClient, withRateLimitByUser } from "~/lib/safe-action"
import {
  generateKey,
  getBucketFromMimeType,
  getSignedPutUrl,
} from "~/lib/storage"
import {
  ConfirmUploadRequestSchema,
  UploadFileRequestSchema,
} from "~/lib/validation"
import {
  createAsset,
  createAssetId,
  markAssetAsUploaded,
} from "~/server/data/asset"
import { createUserId } from "~/server/data/user"
import { buildAssetUrl } from "~/utils/url"

export const uploadFile = authActionClient
  .schema(UploadFileRequestSchema)
  .use(withRateLimitByUser)
  .action(
    async ({ parsedInput: { filename, mimeType, size }, ctx: { user } }) => {
      const userId = createUserId(user.id)
      const key = generateKey(userId, filename)

      const url = await getSignedPutUrl({
        key,
        bucket: StorageBuckets.MAIN,
        mimeType,
      })

      const pendingAsset = await createAsset(userId, {
        bucket: getBucketFromMimeType(mimeType),
        filename,
        mimeType,
        service: "r2",
        size,
        url: buildAssetUrl(key),
      })

      return {
        presignedUrl: url,
        assetId: createAssetId(pendingAsset.id),
      }
    },
  )

export const confirmUpload = authActionClient
  .schema(ConfirmUploadRequestSchema)
  .action(async ({ parsedInput: { assetId }, ctx: { user } }) => {
    const uploadedAsset = await markAssetAsUploaded(
      createAssetId(assetId),
      createUserId(user.id),
    )

    return { url: uploadedAsset.url }
  })
