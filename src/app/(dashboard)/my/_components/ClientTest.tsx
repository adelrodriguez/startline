"use client"

import { UploadButton, UploadDropzone } from "@/components/upload"
import log from "@/utils/log"
import { usePostHog } from "posthog-js/react"

export default function Component() {
  const posthog = usePostHog()

  return (
    <>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          log.success("Files: ", res)
          alert("Upload Completed")
        }}
        onUploadError={(error: Error) => {
          log.error("ERROR! ", error.message)
          // Do something with the error.
          alert(`ERROR! ${error.message}`)
        }}
      />
      <UploadDropzone endpoint="imageUploader" />
      <button
        onClick={() => {
          log.info("clicking test event")
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
