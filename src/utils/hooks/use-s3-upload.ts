import ky from "ky"
import { useCallback } from "react"
import { confirmUpload, uploadFile } from "~/server/actions/upload"
import { UploadError } from "~/utils/error"

export default function useS3Upload(action = uploadFile) {
  const upload = useCallback(
    async (file: File) => {
      const actionResult = await action({
        filename: file.name,
        mimeType: file.type,
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
    [action],
  )

  return { upload }
}
