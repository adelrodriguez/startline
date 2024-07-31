import { APP_ID } from "@/lib/consts"
import { remember } from "@epic-web/remember"
import { EventSchemas, Inngest } from "inngest"
import type { Events } from "./types"

const inngest = remember(
  "inngest",
  () =>
    new Inngest({
      id: APP_ID,
      schemas: new EventSchemas().fromRecord<Events>(),
    }),
)

export default inngest
