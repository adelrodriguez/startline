import { serve } from "@upstash/qstash/nextjs"
import type { WorkflowContext } from "@upstash/qstash/workflow"
import chalk from "chalk"
import { isDevelopment } from "~/lib/vars"

import {
  deleteExpiredEmailVerificationCodes,
  deleteExpiredPasswordResetTokens,
  deleteExpiredSignInCodes,
} from "~/server/data/user"
import { buildBaseUrl } from "~/utils/url"

export async function handler(context: WorkflowContext) {
  const [
    deletedPasswordResetTokens,
    deletedEmailVerificationCodes,
    deletedSignInCodes,
  ] = await Promise.all([
    context.run(
      "delete-expired-password-reset-tokens",
      deleteExpiredPasswordResetTokens,
    ),
    context.run(
      "delete-expired-email-verification-codes",
      deleteExpiredEmailVerificationCodes,
    ),
    context.run("delete-expired-sign-in-codes", deleteExpiredSignInCodes),
  ])

  console.info(
    chalk.green(
      `🚮 Deleted expired password reset tokens: ${deletedPasswordResetTokens}`,
    ),
  )
  console.info(
    chalk.green(
      `📨 Deleted expired email verification codes: ${deletedEmailVerificationCodes}`,
    ),
  )
  console.info(
    chalk.green(`🔓 Deleted expired sign in codes: ${deletedSignInCodes}`),
  )
}

export const POST = serve(handler, {
  baseUrl: isDevelopment ? buildBaseUrl() : undefined,
})
