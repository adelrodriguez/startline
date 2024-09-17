import ky from "ky"
import { useCallback } from "react"
import { confirmUpload, uploadFile } from "~/server/actions/upload"
import { UploadError } from "~/utils/error"
import type { AssetMimeType } from "~/server/data/asset"
import { throwUnless } from "../assert"

export default function useS3Upload(
  action = uploadFile,
  mimeTypes: AssetMimeType[] = [],
) {
  const upload = useCallback(
    async (file: File) => {
      const mimeType = file.type as AssetMimeType

      throwUnless(mimeTypes.includes(mimeType), "Invalid file type")

      const actionResult = await action({
        filename: file.name,
        size: file.size,
        mimeType,
      })

      if (!actionResult?.data) {
        throw new UploadError("Failed to create upload URL")
      }

      const { presignedUrl, assetId } = actionResult.data

      await ky.put(presignedUrl, {
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      const confirmResult = await confirmUpload({ assetId })

      if (!confirmResult?.data) {
        throw new UploadError("Failed to confirm upload")
      }

      return confirmResult.data.url
    },
    [action, mimeTypes],
  )

  return { upload }
}
