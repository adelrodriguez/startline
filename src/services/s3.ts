import { S3Client } from "@aws-sdk/client-s3"
import env from "~/lib/env.server"

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET,
  },
  forcePathStyle: true,
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
})

export default s3
