import {
  Body,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { APP_NAME } from "~/shared/consts"

export default function SignInCodeEmail({ code }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Here's your sign in code for {APP_NAME}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Section className="my-8 text-center">
            <Text className="font-medium text-black">
              Here's your sign in code: {code}
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  )
}

SignInCodeEmail.PreviewProps = {
  code: "123456",
}
