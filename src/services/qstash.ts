import { Client } from "@upstash/qstash"
import env from "~/lib/env.server"

const qstash = new Client({ token: env.QSTASH_TOKEN })

export default qstash
