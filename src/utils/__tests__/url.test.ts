import { describe, expect, test } from "bun:test"
import { buildBaseUrl, buildUrl } from "~/utils/url"

describe("buildBaseUrl", () => {
  test("builds a base url with the correct protocol", () => {
    const url = buildBaseUrl("http")
    const url2 = buildBaseUrl("https")

    expect(url).toBe("http://startline.dev")
    expect(url2).toBe("https://startline.dev")
  })
})

describe("buildUrl", () => {
  test("builds a url", () => {
    const url = buildUrl("/foo")

    expect(url).toBe("https://startline.dev/foo")
  })

  test("builds a url with a custom protocol", () => {
    const url = buildUrl("/foo", { protocol: "http" })

    expect(url).toBe("http://startline.dev/foo")
  })

  test("builds a url with query params", () => {
    const url = buildUrl("/foo", { query: { bar: "{baz}" } })

    expect(url).toBe("https://startline.dev/foo?bar=%7Bbaz%7D")
  })

  test("builds a url with decoded query params", () => {
    const url = buildUrl("/foo", { query: { bar: "{baz}" }, decoded: true })

    expect(url).toBe("https://startline.dev/foo?bar={baz}")
  })
})
