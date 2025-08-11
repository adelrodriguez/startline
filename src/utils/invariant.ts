import { DatabaseError } from "~/shared/error"

export function invariant(
  condition: boolean,
  message: string
): asserts condition
export function invariant(
  condition: boolean,
  throwable: Error
): asserts condition
export function invariant(
  condition: boolean,
  throwable: Error | string
): asserts condition {
  if (condition) {
    return
  }

  throw typeof throwable === "string" ? new Error(throwable) : throwable
}

export function invariantReturning<T>(
  record: T | null | undefined,
  message = "Failed to create record"
): asserts record is T {
  invariant(!!record, new DatabaseError(message))
}
