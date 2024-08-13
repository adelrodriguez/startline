import { APP_ID } from "@/lib/consts"
import env from "@/lib/env.server"
import { EventSchemas, Inngest } from "inngest"
import type { Events } from "./types"

const inngest = new Inngest({
  id: APP_ID,
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: env.INNGEST_EVENT_KEY,
})

export default inngest
