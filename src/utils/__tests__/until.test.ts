import { describe, expect, test } from "bun:test"
import { until } from "~/utils/until"

describe("until", () => {
  test("should return [null, result] for a successful promise", async () => {
    const successPromise = async () => "success"
    const [error, result] = await until(successPromise)

    expect(error).toBeNull()
    expect(result).toBe("success")
  })

  test("should return [error, null] for a rejected promise", async () => {
    const failurePromise = async () => {
      throw new Error("failure")
    }
    const [error, result] = await until(failurePromise)

    expect(error).toBeInstanceOf(Error)
    expect(result).toBeNull()
    if (error instanceof Error) {
      expect(error.message).toBe("failure")
    } else {
      throw new Error("Expected error to be an instance of Error")
    }
  })

  test("should work with different return types", async () => {
    const numberPromise = async () => 42
    const [error, result] = await until(numberPromise)

    expect(error).toBeNull()
    expect(result).toBe(42)
  })

  test("should handle async functions with parameters", async () => {
    const paramPromise = async (x: number, y: number) => x + y
    const [error, result] = await until(() => paramPromise(2, 3))

    expect(error).toBeNull()
    expect(result).toBe(5)
  })

  test("should handle promises that resolve after a delay", async () => {
    const delayedPromise = () =>
      new Promise<string>((resolve) =>
        setTimeout(() => resolve("delayed"), 100),
      )
    const [error, result] = await until(delayedPromise)

    expect(error).toBeNull()
    expect(result).toBe("delayed")
  })
})
