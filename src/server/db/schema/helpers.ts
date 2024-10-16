import { pgTableCreator } from "drizzle-orm/pg-core"

// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = pgTableCreator((name) => name)
