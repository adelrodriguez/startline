import { AssertionError } from "@/utils/error"

/**
 * Throws an assertion error if the condition is false. This is useful if you
 * need type narrowing.
 */
export function throwUnless(
  condition: boolean,
  message?: string,
): asserts condition {
  if (condition) return

  throw new AssertionError(message)
}

/**
 * Throws an assertion error if the condition is true. This is useful for
 * business rules that do not need type narrowing.
 */
export function throwIf(condition: boolean, message?: string): void {
  if (!condition) return

  throw new AssertionError(message)
}
