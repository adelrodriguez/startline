import "server-only"
import { render } from "@react-email/render"
import chalk from "chalk"
import type { ReactElement } from "react"
import env from "~/lib/env.server"
import { SendEmailError } from "~/lib/error"
import resend from "~/services/resend"

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactElement,
  sendAt?: Date | string,
) {
  if (env.MOCK_RESEND) {
    const content = await render(body, { plainText: true })

    console.warn(chalk.bold.yellowBright("📪 env.MOCK_RESEND is set!"))
    console.info(chalk.green("📫 Sending email to", email))
    console.info(chalk.green("📝 Email content:"))
    console.info(chalk.gray("----------------------------------------"))
    console.info(chalk.gray.italic(content))
    console.info(chalk.gray("----------------------------------------"))

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
    throw new SendEmailError(
      {
        name: error.name,
        message: error.message,
        email,
      },
      error,
    )
  }
}
