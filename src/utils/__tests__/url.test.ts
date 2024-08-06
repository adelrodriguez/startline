import { buildUrl } from "@/utils/url"
import { expect, test } from "vitest"

test("builds a url", () => {
  const url = buildUrl("/foo")

  expect(url).toBe("http://localhost:3000/foo")
})

test("builds a url with query params", () => {
  const url = buildUrl("/foo", { query: { bar: "{baz}" } })

  expect(url).toBe("http://localhost:3000/foo?bar=%7Bbaz%7D")
})

test("builds a url with decoded query params", () => {
  const url = buildUrl("/foo", { query: { bar: "{baz}" }, decoded: true })

  expect(url).toBe("http://localhost:3000/foo?bar={baz}")
})
