"server-only"

import env from "@/lib/env.server"

import Stripe from "stripe"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
})

export default stripe
