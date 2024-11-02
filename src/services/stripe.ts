import Stripe from "stripe"
import env from "~/lib/env.server"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
})

export default stripe
