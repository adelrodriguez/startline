import { Fragment } from "react"
import {
  Body,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { APPLICATION_NAME } from "@/lib/consts"

export default function SignInCodeEmail({ code }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email for {APPLICATION_NAME}</Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Section className="my-8 text-center">
              <Text className="font-medium text-black">
                Here's your verify email code: {code}
              </Text>
            </Section>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  )
}

SignInCodeEmail.PreviewProps = {
  code: "123456",
}
