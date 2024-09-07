import Stripe from "stripe"
import env from "~/lib/env.server"

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
})

export default stripe
