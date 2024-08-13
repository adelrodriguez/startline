import { buildBaseUrl, buildUrl } from "@/utils/url"
import { expect, test } from "vitest"

test("builds a base url", () => {
  const url = buildBaseUrl()

  expect(url).toBe("https://startline.dev")
})

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
