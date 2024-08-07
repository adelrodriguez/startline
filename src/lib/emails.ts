"server-only"

import { MOCK_RESEND_EMAIL } from "@/lib/consts"
import env from "@/lib/env.server"
import resend from "@/services/resend"
import { SendEmailError } from "@/utils/error"
import log from "@/utils/log"
import { render } from "@react-email/render"
import chalk from "chalk"
import type { ReactElement } from "react"

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactElement,
) {
  if (env.RESEND_API_KEY === MOCK_RESEND_EMAIL) {
    log.info("MOCKING EMAIL SEND")

    console.info(chalk.bold.blue("Sending email to"), chalk.italic.white(email))
    log.info("Email content:")
    console.info(
      chalk.italic(
        render(body, {
          plainText: true,
        }),
      ),
    )

    return
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    react: body,
  })

  if (error) {
    throw new SendEmailError(error.name, error.message, email)
  }
}
