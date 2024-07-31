import env from "@/lib/env.server"
import { remember } from "@epic-web/remember"
import { Resend } from "resend"

const resend = remember("resend", () => new Resend(env.RESEND_API_KEY))

export default resend
