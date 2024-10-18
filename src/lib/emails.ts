import "server-only"
import { render } from "@react-email/render"
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

    console.info("===> MOCKING EMAIL SEND")
    console.info("===> Sending email to", email)
    console.info("===> Email content:")
    console.info("----------------------------------------")
    console.info(content)
    console.info("----------------------------------------")

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
