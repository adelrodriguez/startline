import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { type StorageBucket, StorageBuckets } from "~/lib/consts"
import type { UserId } from "~/server/db"
import s3 from "~/services/s3"
import { obfuscate } from "~/utils/obfuscator"

export function generateKey(userId: UserId, filename: string): string {
  return `${obfuscate(userId)}/${sanitizeKey(filename)}`
}

export function sanitizeKey(key: string): string {
  return key
    .trim()
    .replace(/[^0-9a-zA-Z!_.*'()-.]/g, " ")
    .replace(/\s+/g, "-")
}

export async function getSignedPutUrl({
  key,
  bucket,
  mimeType,
  expiresIn = 60 * 60,
}: {
  key: string
  bucket: StorageBucket
  mimeType: string
  expiresIn?: number
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
  })

  const signedUrl = await getSignedUrl(s3, command, { expiresIn })

  return signedUrl
}

export function getBucketFromMimeType(mimeType: string): StorageBucket {
  if (mimeType.startsWith("image/")) {
    return StorageBuckets.IMAGES
  }

  return StorageBuckets.MAIN
}
