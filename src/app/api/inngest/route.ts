import inngest, { helloWorld } from "@/services/inngest"
import { serve } from "inngest/next"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld],
})
