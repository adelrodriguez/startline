import db, {
  asset,
  type Asset,
  filters,
  type AssetId,
  type UserId,
} from "~/server/db"

export function createAssetId(id: number): AssetId {
  return id as AssetId
}

export async function findAssetById(id: AssetId) {
  return db.select().from(asset).where(filters.eq(asset.id, id))
}

export async function createAsset(
  userId: UserId,
  values: typeof asset.$inferInsert,
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
