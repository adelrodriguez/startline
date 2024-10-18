import "server-only"
import type { UserId } from "~/server/data/user"
import db, { asset, filters } from "~/server/db"
import { DatabaseError } from "~/utils/error"

export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert
export type AssetId = Asset["id"]
export type AssetPublicId = Asset["publicId"]
export type AssetMimeType = Asset["mimeType"]

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

  return uploadedAsset
}
