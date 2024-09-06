import { describe, expect, it } from "vitest"
import { until } from "~/utils/until"

describe("until", () => {
  it("should return [result, null] for a successful promise", async () => {
    const successPromise = async () => "success"
    const [result, error] = await until(successPromise)

    expect(result).toBe("success")
    expect(error).toBeNull()
  })

  it("should return [null, error] for a rejected promise", async () => {
    const failurePromise = async () => {
      throw new Error("failure")
    }
    const [result, error] = await until(failurePromise)

    expect(result).toBeNull()
    expect(error).toBeInstanceOf(Error)
    expect(error?.message).toBe("failure")
  })

  it("should work with different return types", async () => {
    const numberPromise = async () => 42
    const [result, error] = await until(numberPromise)

    expect(result).toBe(42)
    expect(error).toBeNull()
  })

  it("should handle async functions with parameters", async () => {
    const paramPromise = async (x: number, y: number) => x + y
    const [result, error] = await until(() => paramPromise(2, 3))

    expect(result).toBe(5)
    expect(error).toBeNull()
  })

  it("should handle promises that resolve after a delay", async () => {
    const delayedPromise = () =>
      new Promise((resolve) => setTimeout(() => resolve("delayed"), 100))
    const [result, error] = await until(delayedPromise)

    expect(result).toBe("delayed")
    expect(error).toBeNull()
  })
})
