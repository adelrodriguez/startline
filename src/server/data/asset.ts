import "server-only"

import { z } from "zod"
import { logActivity } from "~/lib/logger"
import type { UserId } from "~/server/data/user"
import db, { asset, filters } from "~/server/db"

export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert

export type AssetMimeType = Asset["mimeType"]

export const AssetId = z.number().brand<"AssetId">()
export type AssetId = z.infer<typeof AssetId>

export async function findAssetById(id: AssetId) {
  return db.select().from(asset).where(filters.eq(asset.id, id))
}

export async function createAsset(
  userId: UserId,
  values: NewAsset,
): Promise<Asset> {
  const newAsset = await db
    .insert(asset)
    .values({ ...values, userId })
    .returning()
    .get()

  await logActivity("created_asset", { userId })

  return newAsset
}

export async function markAssetAsUploaded(
  assetId: AssetId,
  userId: UserId,
): Promise<Asset> {
  const uploadedAsset = await db
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
    .get()

  await logActivity("marked_asset_as_uploaded", { userId })

  return uploadedAsset
}
