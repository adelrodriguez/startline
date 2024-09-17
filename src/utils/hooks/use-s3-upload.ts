import ky from "ky"
import { useCallback } from "react"
import { confirmUpload, uploadFile } from "~/server/actions/upload"
import { UploadError } from "~/utils/error"
import type { MimeType } from "~/lib/consts"
import { throwUnless } from "../assert"

export default function useS3Upload(
  action = uploadFile,
  mimeTypes: MimeType[] = [],
) {
  const upload = useCallback(
    async (file: File) => {
      throwUnless(
        mimeTypes.includes(file.type as MimeType),
        "Invalid file type",
      )

      const actionResult = await action({
        filename: file.name,
        mimeType: file.type as MimeType,
        size: file.size,
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
