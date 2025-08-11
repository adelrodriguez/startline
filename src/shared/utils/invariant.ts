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
