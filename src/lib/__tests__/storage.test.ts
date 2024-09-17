import { describe, expect, test } from "bun:test"
import { sanitizeKey } from "~/lib/storage"

describe("sanitizeKey", () => {
  test("removes leading and trailing spaces", () => {
    expect(sanitizeKey("  file.jpg  ")).toBe("file.jpg")
  })

  test("replaces spaces with hyphens", () => {
    expect(sanitizeKey("my file.jpg")).toBe("my-file.jpg")
  })

  test("removes special characters except allowed ones", () => {
    expect(sanitizeKey("file!@#$%^&*.jpg")).toBe("file!-*.jpg")
  })

  test("preserves allowed special characters", () => {
    expect(sanitizeKey("file!_.*'()-/.jpg")).toBe("file!_.*'()--.jpg")
  })

  test("preserves case", () => {
    expect(sanitizeKey("MyFile.JPG")).toBe("MyFile.JPG")
  })

  test("handles multiple extensions", () => {
    expect(sanitizeKey("file.tar.gz")).toBe("file.tar.gz")
  })

  test("handles filenames without extensions", () => {
    expect(sanitizeKey("README")).toBe("README")
  })

  test("handles empty strings", () => {
    expect(sanitizeKey("")).toBe("")
  })

  test("replaces multiple spaces with a single hyphen", () => {
    expect(sanitizeKey("my   file  name.jpg")).toBe("my-file-name.jpg")
  })
})
