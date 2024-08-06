import env from "@/lib/env.server"

import { Resend } from "resend"

const resend = new Resend(env.RESEND_API_KEY)

export default resend
