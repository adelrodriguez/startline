"server-only"

import { MOCK_RESEND_EMAIL } from "@/lib/consts"
import env from "@/lib/env.server"
import resend from "@/services/resend"
import { SendEmailError } from "@/utils/error"
import { render } from "@react-email/render"
import type { ReactElement } from "react"

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactElement,
) {
  if (env.RESEND_API_KEY === MOCK_RESEND_EMAIL) {
    console.info("MOCKING EMAIL SEND")
    console.info("Sending email to", email)
    console.info(
      "Email content:",
      render(body, {
        plainText: true,
      }),
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
