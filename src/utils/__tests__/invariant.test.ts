import { describe, expect, test } from "bun:test"
import { DatabaseError } from "~/shared/error"
import { invariant, invariantReturning } from "../invariant"

describe("invariant", () => {
  test("should not throw when condition is true", () => {
    expect(() => invariant(true, "This should not throw")).not.toThrow()
  })

  test("should throw Error with message when condition is false and message is provided", () => {
    const errorMessage = "This should throw"
    expect(() => invariant(false, errorMessage)).toThrow(errorMessage)
  })

  test("should throw provided Error when condition is false and Error is provided", () => {
    const customError = new Error("Custom error")
    expect(() => invariant(false, customError)).toThrow(customError)
  })
})

describe("invariantReturning", () => {
  test("should not throw when record is provided", () => {
    const record = { id: 1, name: "Test" }
    expect(() => invariantReturning(record)).not.toThrow()
  })

  test("should throw DatabaseError when record is null", () => {
    expect(() => invariantReturning(null)).toThrow(DatabaseError)
  })

  test("should throw DatabaseError when record is undefined", () => {
    expect(() => invariantReturning(undefined)).toThrow(DatabaseError)
  })

  test("should throw DatabaseError with custom message when provided", () => {
    const customMessage = "Custom error message"
    expect(() => invariantReturning(null, customMessage)).toThrow(DatabaseError)
    expect(() => invariantReturning(null, customMessage)).toThrow(customMessage)
  })

  test("should use default error message when record is null and no message is provided", () => {
    expect(() => invariantReturning(null)).toThrow("Failed to create record")
  })
})
