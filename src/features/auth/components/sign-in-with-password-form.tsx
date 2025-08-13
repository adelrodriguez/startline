"use client"

import Link from "next/link"
import { redirect } from "next/navigation"
import { SignInWithPasswordFormSchema as schema } from "~/features/auth/validation"
import { authClient } from "~/shared/auth/client"
import { Button } from "~/shared/components/ui/button"
import { useAppForm } from "~/shared/components/ui/form"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"

export default function SignInWithPasswordForm() {
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })

      redirect(AUTHORIZED_PATHNAME)
    },
  })

  return (
    <form
      className="flex flex-col gap-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()

        form.handleSubmit()
      }}
    >
      <form.AppForm>
        <form.AppField name="email" validators={{ onBlur: schema.shape.email }}>
          {(field) => (
            <field.Item>
              <field.Label>Email address</field.Label>
              <field.Control>
                <field.Input autoComplete="email" type="email" />
              </field.Control>

              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="password"
          validators={{ onBlur: schema.shape.password }}
        >
          {(field) => (
            <field.Item>
              <field.Label>Password</field.Label>
              <field.Control>
                <field.Input autoComplete="current-password" type="password" />
              </field.Control>
              <field.Message />
              <Button asChild className="p-0" variant="link">
                <Link href="/sign-in/reset-password">Forgot password?</Link>
              </Button>
            </field.Item>
          )}
        </form.AppField>
        <form.ServerError title="Form Error" />
        <form.SubmitButton className="w-full" loadingText="Signing in...">
          Sign in
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
