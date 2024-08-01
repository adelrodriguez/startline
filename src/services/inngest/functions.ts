import {
  cleanExpiredEmailVerificationCodes,
  cleanExpiredPasswordResetTokens,
  cleanExpiredSignInCodes,
} from "@/server/data"
import inngest from "./client"

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
