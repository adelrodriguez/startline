import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react"

import type { FileRouter } from "~/services/uploadthing"

export const UploadButton = generateUploadButton<FileRouter>()
export const UploadDropzone = generateUploadDropzone<FileRouter>()
