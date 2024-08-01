import { validateRequest } from "@/lib/auth"
import {
  type FileRouter as UploadThingFileRouter,
  createUploadthing,
} from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

const router = createUploadthing()

const auth = (req: Request) => ({ id: "fakeId" }) // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const fileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: router({ image: { maxFileSize: "32MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const { user } = await validateRequest()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized")

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId)

      console.log("file url", file.url)

      return { uploadedBy: metadata.userId }
    }),
} satisfies UploadThingFileRouter

export type FileRouter = typeof fileRouter
export default fileRouter
