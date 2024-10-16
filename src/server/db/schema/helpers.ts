import { pgTableCreator } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
// You can add a prefix to table names to host multiple projects on the same
// database
export const createTable = pgTableCreator((name) => name)

export const createPublicId = (prefix: string) => () => `${prefix}_${nanoid()}`
