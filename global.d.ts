import type en from "./translations/en.json" with { type: "json" }
import type es from "./translations/es.json" with { type: "json" }

type Messages = typeof en & typeof es

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
