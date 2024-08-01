"use client"

import { UploadButton, UploadDropzone } from "@/components/upload"

export default function Component() {
  return (
    <>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res)
          alert("Upload Completed")
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`)
        }}
      />
      <UploadDropzone endpoint="imageUploader" />
    </>
  )
}
