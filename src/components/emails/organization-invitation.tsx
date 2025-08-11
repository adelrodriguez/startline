import {
  Body,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { Fragment } from "react"
import { ACCEPT_INVITATION_URL, APP_NAME } from "~/lib/consts"
import { buildUrl } from "~/utils/url"

export default function OrganizationInvitationEmail({
  organizationName,
  invitationToken,
}: {
  organizationName: string
  invitationToken: string
}) {
  return (
    <Html>
      <Head />
      <Preview>
        You've been invited to join {organizationName} on {APP_NAME}
      </Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Section className="my-8">
              <Text className="font-bold text-xl">
                You've been invited to join {organizationName}
              </Text>
              <Text>
                Click the link below to accept the invitation and join the
                organization:
              </Text>
              <Section className="my-4 text-center">
                <Link
                  className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
                  href={buildUrl(`${ACCEPT_INVITATION_URL}/${invitationToken}`)}
                >
                  Accept Invitation
                </Link>
              </Section>
              <Text className="text-gray-500 text-sm">
                If you didn't expect this invitation, you can safely ignore this
                email.
              </Text>
            </Section>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  )
}

OrganizationInvitationEmail.PreviewProps = {
  organizationName: "Acme Inc.",
  invitationToken: "test-invitation-token",
}
