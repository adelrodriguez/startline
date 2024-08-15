import {
  cleanExpiredEmailVerificationCodes,
  cleanExpiredPasswordResetTokens,
  cleanExpiredSignInCodes,
  markWebhookEventAsProcessed,
} from "@/server/data"
import inngest from "./client"
import { StripeError } from "@/utils/error"

export const cleanExpiredCodes = inngest.createFunction(
  {
    id: "clean-expired-codes",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const signInCodesDeleted = await step.run(
      "clean-sign-in-codes",
      cleanExpiredSignInCodes,
    )
    console.log(`Deleted ${signInCodesDeleted} sign-in codes`)

    const emailVerificationCodesDeleted = await step.run(
      "clean-email-verification-codes",
      cleanExpiredEmailVerificationCodes,
    )
    console.log(
      `Deleted ${emailVerificationCodesDeleted} email verification codes`,
    )

    const passwordResetTokensDeleted = await step.run(
      "clean-password-reset-tokens",
      cleanExpiredPasswordResetTokens,
    )
    console.log(`Deleted ${passwordResetTokensDeleted} password reset tokens`)
  },
)

export const processStripeWebhookEvent = inngest.createFunction(
  {
    id: "process-stripe-webhook-event",
  },
  {
    event: "stripe/webhook-event",
  },
  async ({ event }) => {
    switch (event.data.payload.type) {
      case "customer.subscription.created":
        break
      // Handle the necessary events here
      default:
        throw new StripeError(
          `Unhandled event type: ${event.data.payload.type}`,
        )
    }

    await markWebhookEventAsProcessed(event.data.webhookEventId)
  },
)
