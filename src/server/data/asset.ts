import "server-only"

import { z } from "zod"
import db, { asset, filters } from "~/server/db"
import type { UserId } from "~/server/data/user"

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
  return db
    .insert(asset)
    .values({ ...values, userId })
    .returning()
    .get()
}

export async function markAssetAsUploaded(
  assetId: AssetId,
  userId: UserId,
): Promise<Asset> {
  return db
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
}
