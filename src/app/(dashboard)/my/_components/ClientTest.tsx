"use client"

import { UploadButton, UploadDropzone } from "@/components/upload"
import { usePostHog } from "posthog-js/react"

export default function Component() {
  const posthog = usePostHog()

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
      <button
        onClick={() => {
          console.log("clicking test event")
          posthog.capture("test event", {
            property: "value",
          })
        }}
        type="button"
      >
        Capture
      </button>
    </>
  )
}
