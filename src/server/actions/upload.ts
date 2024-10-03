"use server"

import { StorageBuckets } from "~/lib/consts"
import {
  authActionClient,
  withRateLimitByUser,
  withUserId,
} from "~/lib/safe-action"
import {
  generateKey,
  getBucketFromMimeType,
  getSignedPutUrl,
} from "~/lib/storage"
import {
  ConfirmUploadRequestSchema,
  UploadFileRequestSchema,
} from "~/lib/validation/upload"
import {
  AssetId,
  createAsset,
  markAssetAsUploaded,
  type AssetMimeType,
} from "~/server/data/asset"
import { buildAssetUrl } from "~/utils/url"

export const uploadFile = authActionClient
  .schema(UploadFileRequestSchema)
  .use(withRateLimitByUser)
  .use(withUserId)
  .action(
    async ({ parsedInput: { filename, mimeType, size }, ctx: { userId } }) => {
      const key = generateKey(userId, filename)

      const url = await getSignedPutUrl({
        key,
        bucket: StorageBuckets.MAIN,
        mimeType,
      })

      const pendingAsset = await createAsset(userId, {
        bucket: getBucketFromMimeType(mimeType as AssetMimeType),
        filename,
        mimeType: mimeType as AssetMimeType,
        service: "r2",
        size,
        url: buildAssetUrl(key),
      })

      return {
        presignedUrl: url,
        assetId: AssetId.parse(pendingAsset.id),
      }
    },
  )

export const confirmUpload = authActionClient
  .schema(ConfirmUploadRequestSchema)
  .use(withUserId)
  .action(async ({ parsedInput: { assetId }, ctx: { userId } }) => {
    const uploadedAsset = await markAssetAsUploaded(
      AssetId.parse(assetId),
      userId,
    )

    return { url: uploadedAsset.url }
  })
