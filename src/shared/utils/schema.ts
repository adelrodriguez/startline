import * as z from "zod"

// Create custom zod types here and import them to other packages under the `z` namespace.

export function env() {
  return z.enum(["development", "production", "test"])
}

export * from "zod"
export * as form from "zod-form-data"
