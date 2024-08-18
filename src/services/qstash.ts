import env from "@/lib/env.server"
import { Client } from "@upstash/qstash"

const qstash = new Client({ token: env.QSTASH_TOKEN })

export default qstash
