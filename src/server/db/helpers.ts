import db from "./client"

export function batch<T extends Parameters<typeof db.batch>[0]>(batchItems: T) {
  return db.batch(batchItems)
}
