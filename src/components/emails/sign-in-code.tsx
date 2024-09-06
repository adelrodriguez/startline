import {
  Body,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { Fragment } from "react"
import { APP_NAME } from "~/lib/consts"

export default function SignInCodeEmail({ code }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Here's your sign in code for {APP_NAME}</Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Section className="my-8 text-center">
              <Text className="font-medium text-black">
                Here's your sign in code: {code}
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
