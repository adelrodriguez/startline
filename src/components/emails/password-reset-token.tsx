import {
  Body,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components"
import { Fragment } from "react"
import { APP_NAME, RESET_PASSWORD_URL } from "~/lib/consts"
import { buildUrl } from "~/utils/url"

export default function PasswordResetTokenEmail({ token }: { token: string }) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email for {APP_NAME}</Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Section className="my-8 text-center">
              <Link href={buildUrl(`${RESET_PASSWORD_URL}/${token}`)}>
                Reset password
              </Link>
            </Section>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  )
}

PasswordResetTokenEmail.PreviewProps = {
  token: "test-token",
}
