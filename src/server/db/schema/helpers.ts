import { sql } from "drizzle-orm"
import { sqliteTableCreator } from "drizzle-orm/sqlite-core"

export const CURRENT_TIMESTAMP = sql`(unixepoch())`

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = sqliteTableCreator((name) => name)
