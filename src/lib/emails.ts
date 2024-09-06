import "server-only"
import { render } from "@react-email/render"
import chalk from "chalk"
import type { ReactElement } from "react"
import env from "~/lib/env.server"
import resend from "~/services/resend"
import { SendEmailError } from "~/utils/error"

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactElement,
  sendAt?: Date,
) {
  if (env.MOCK_RESEND) {
    const content = await render(body, { plainText: true })

    console.info(chalk.bold.italic.blue("MOCKING EMAIL SEND"))
    console.info(chalk.bold.blue("Sending email to"), chalk.italic.white(email))
    console.info("Email content:")
    console.info(chalk.italic(content))

    return
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    react: body,
    scheduledAt: sendAt?.toISOString(),
  })

  if (error) {
    throw new SendEmailError(error.name, error.message, email)
  }
}
