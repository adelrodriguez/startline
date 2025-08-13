import "server-only"

import { render } from "@react-email/render"
import chalk from "chalk"
import type { ReactElement } from "react"
import { Resend } from "resend"
import env from "~/shared/env"
import { logger } from "~/shared/logger"

const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactElement,
  sendAt?: Date | string
) {
  if (env.MOCK_RESEND) {
    const content = await render(body, { plainText: true })

    logger.warn(chalk.bold.yellowBright("📪 env.MOCK_RESEND is set!"))
    logger.info(chalk.green("📫 Sending email to", email))
    logger.info(chalk.green("📝 Email content:"))
    logger.info(chalk.gray("----------------------------------------"))
    logger.info(chalk.gray.italic(content))
    logger.info(chalk.gray("----------------------------------------"))

    return
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    react: body,
    scheduledAt: typeof sendAt === "string" ? sendAt : sendAt?.toISOString(),
  })

  if (error) {
    throw new Error(`Failed to send email to ${email}: ${error.message}`, {
      cause: error,
    })
  }
}

export default resend
