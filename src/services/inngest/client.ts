import { APP_ID } from "@/lib/consts"
import { EventSchemas, Inngest } from "inngest"
import type { Events } from "./types"

const inngest = new Inngest({
  id: APP_ID,
  schemas: new EventSchemas().fromRecord<Events>(),
})

export default inngest
