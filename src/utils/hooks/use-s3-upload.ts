import ky from "ky"
import { useCallback } from "react"
import { UploadError } from "~/lib/error"
// import { confirmUpload, uploadFile } from "~/server/actions/upload"
import type { AssetMimeType } from "~/server/data/asset"

export default function useS3Upload(
  // action = uploadFile,
  mimeTypes: AssetMimeType[] = []
) {
  const upload = useCallback(
    async (file: File) => {
      const mimeType = file.type as AssetMimeType

      if (!mimeTypes.includes(mimeType)) {
        throw new UploadError("Invalid file type")
      }

      // const actionResult = await action({
      //   filename: file.name,
      //   size: file.size,
      //   mimeType,
      // })
      const actionResult = { data: { presignedUrl: "", publicId: "test" } }

      if (!actionResult?.data) {
        throw new UploadError("Failed to create upload URL")
      }

      const { presignedUrl, publicId } = actionResult.data

      await ky.put(presignedUrl, {
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      // const confirmResult = await confirmUpload({ publicId })
      const confirmResult = { data: { success: true } }

      if (!confirmResult?.data) {
        throw new UploadError("Failed to confirm upload")
      }

      return "https://example.com/uploaded-file.jpg"
    },
    [mimeTypes]
  )

  return { upload }
}
