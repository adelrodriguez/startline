import "server-only"

import { z } from "zod"
import { logActivity } from "~/lib/logger"
import type { UserId } from "~/server/data/user"
import db, { asset, filters } from "~/server/db"
import { DatabaseError } from "~/utils/error"

export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert

export type AssetMimeType = Asset["mimeType"]

export const AssetId = z.bigint().brand<"AssetId">()
export type AssetId = z.infer<typeof AssetId>

export const AssetPublicId = z.string().brand<"AssetPublicId">()
export type AssetPublicId = z.infer<typeof AssetPublicId>

export async function findAssetById(id: AssetId): Promise<Asset | null> {
  const existingAsset = await db.query.asset.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  })

  return existingAsset ?? null
}

export async function findAssetByPublicId(
  publicId: AssetPublicId,
): Promise<Asset | null> {
  const existingAsset = await db.query.asset.findFirst({
    where: (model, { eq }) => eq(model.publicId, publicId),
  })

  return existingAsset ?? null
}

export async function createAsset(
  userId: UserId,
  values: NewAsset,
): Promise<Asset> {
  const [newAsset] = await db
    .insert(asset)
    .values({ ...values, userId })
    .returning()

  if (!newAsset) {
    throw new DatabaseError("Failed to create asset")
  }

  await logActivity("created_asset", { userId })

  return newAsset
}

export async function markAssetAsUploaded(
  assetId: AssetId,
  userId: UserId,
): Promise<Asset> {
  const [uploadedAsset] = await db
    .update(asset)
    .set({ status: "uploaded" })
    .where(
      filters.and(
        filters.eq(asset.id, assetId),
        filters.eq(asset.status, "pending"),
        filters.eq(asset.userId, userId),
      ),
    )
    .returning()

  if (!uploadedAsset) {
    throw new DatabaseError("Failed to mark asset as uploaded")
  }

  await logActivity("marked_asset_as_uploaded", { userId })

  return uploadedAsset
}
