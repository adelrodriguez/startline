"server-only"

import env from "@/lib/env.server"
import { remember } from "@epic-web/remember"
import Stripe from "stripe"

const stripe = remember("stripe", () => new Stripe(env.STRIPE_SECRET_KEY))

export default stripe
