"server-only"

import resend from "@/services/resend"
import type { ReactNode } from "react"
import env from "@/lib/env.server"
import { SendEmailError } from "@/utils/error"

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactNode,
) {
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
