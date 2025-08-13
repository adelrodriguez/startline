"use client"

import { redirect } from "next/navigation"
import { SignUpFormSchema as schema } from "~/features/auth/validation"
import { useAppForm } from "~/shared/components/ui/form"
import { AUTHORIZED_PATHNAME } from "~/shared/constants"
import { authClient } from "~~/src/shared/auth/client"

export default function SignUpForm() {
  const form = useAppForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => redirect(AUTHORIZED_PATHNAME),
        }
      )
    },
  })

  return (
    <form
      //   action={action}
      className="flex flex-col gap-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()

        form.handleSubmit()
      }}
    >
      <form.AppForm>
        <form.AppField name="name" validators={{ onBlur: schema.shape.name }}>
          {(field) => (
            <field.Item>
              <field.Label>Name</field.Label>
              <field.Control>
                <field.Input autoComplete="name" type="text" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="email"
          validators={{
            onBlur: schema.shape.email,
            // onBlurAsync: async ({ value }) => {
            //   const { isAvailable } =
            //     await trpcClient.auth.checkEmailAvailability.query({
            //       email: value,
            //     })

            //   if (isAvailable) {
            //     return null
            //   }

            //   return { message: "Email is already in use" }
            // },
          }}
        >
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
                <field.Input autoComplete="new-password" type="password" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.AppField
          name="confirmPassword"
          validators={{
            onBlur: schema.shape.confirmPassword.refine(
              (v) => v === form.getFieldValue("password"),
              {
                message: "Passwords don't match",
              }
            ),
            onBlurListenTo: ["password"],
            onChangeListenTo: ["password"],
          }}
        >
          {(field) => (
            <field.Item>
              <field.Label>Confirm Password</field.Label>
              <field.Control>
                <field.Input autoComplete="new-password" type="password" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.ServerError />
        <form.SubmitButton className="w-full" loadingText="Signing up...">
          Sign up
        </form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
