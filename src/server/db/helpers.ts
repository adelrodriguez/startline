import { type AnyColumn, sql } from "drizzle-orm"

export function increment(column: AnyColumn, value = 1) {
  return sql`${column} + ${value}`
}

export function decrement(column: AnyColumn, value = 1) {
  return sql`${column} - ${value}`
}

export { count, type SQL, sql } from "drizzle-orm"
