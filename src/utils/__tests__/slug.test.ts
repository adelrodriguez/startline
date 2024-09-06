import { describe, expect, test } from "vitest"
import { generateSlug } from "~/utils/slug"

describe("generateSlug", () => {
  test("generates a basic slug", () => {
    const slug = generateSlug("Hello World!")
    expect(slug).toBe("hello-world")
  })

  test("handles special characters", () => {
    const slug = generateSlug("Special $#@! Characters")
    expect(slug).toBe("special-dollar-characters")
  })

  test("handles accented characters", () => {
    const slug = generateSlug("Café au lait")
    expect(slug).toBe("cafe-au-lait")
  })

  test("handles multiple spaces", () => {
    const slug = generateSlug("Multiple   Spaces")
    expect(slug).toBe("multiple-spaces")
  })

  test("trims leading and trailing spaces", () => {
    const slug = generateSlug("  Trim Spaces  ")
    expect(slug).toBe("trim-spaces")
  })

  test("handles different locales", () => {
    const slug = generateSlug("Über Österreich", { locale: "de" })
    expect(slug).toBe("ueber-oesterreich")
  })

  test("respects the replacement option", () => {
    const slug = generateSlug("Replace Spaces", { replacement: "_" })
    expect(slug).toBe("replace_spaces")
  })

  test("respects the lower option", () => {
    const slug = generateSlug("Keep Uppercase", { lower: false })
    expect(slug).toBe("Keep-Uppercase")
  })

  test("respects the strict option", () => {
    const slug = generateSlug("Non-Strict!", { strict: false })
    expect(slug).toBe("non-strict!")
  })

  test("handles custom remove regex", () => {
    const slug = generateSlug("Remove Custom", { remove: /[aeiou]/g })
    expect(slug).toBe("rmv-cstm")
  })

  test("handles empty string", () => {
    const slug = generateSlug("")
    expect(slug).toBe("")
  })

  test("handles non-string input", () => {
    const slug = generateSlug(123 as unknown as string)
    expect(slug).toBe("123")
  })

  test("handles append option", () => {
    const slug = generateSlug("Append Test", { append: "suffix" })
    expect(slug).toBe("append-test-suffix")
  })

  test("handles currency symbols", () => {
    const slug = generateSlug("Price is $100 or £80")
    expect(slug).toBe("price-is-dollar100-or-pound80")
  })

  test("handles mathematical symbols", () => {
    const slug = generateSlug("Sum is ∑ and ∞ is infinity")
    expect(slug).toBe("sum-is-sum-and-infinity-is-infinity")
  })

  test("handles different locales with special characters", () => {
    const slug = generateSlug("Процент % и амперсанд &", { locale: "ru" })
    expect(slug).toBe("procent-protsent-i-ampersand-i")
  })

  test("handles emoji", () => {
    const slug = generateSlug("I ♥ coding")
    expect(slug).toBe("i-love-coding")
  })
})
