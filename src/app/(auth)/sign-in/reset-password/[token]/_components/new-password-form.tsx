"use client"

import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Loader2Icon } from "lucide-react"
import { useFormState } from "react-dom"
import {
  Form,
  FormItem,
  FormMessage,
  FormSubmit,
  Input,
  Label,
} from "~/components/ui"
import { createNewPasswordSchema } from "~/lib/validation/forms"
import { resetPassword } from "~/server/actions/auth"

export default function NewPasswordForm({ token }: { token: string }) {
  const [lastResult, action] = useFormState(resetPassword, undefined)
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { token },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: createNewPasswordSchema() }),

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <Form {...getFormProps(form)} action={action}>
      <input {...getInputProps(fields.token, { type: "hidden" })} />
      <FormItem>
        <Label htmlFor={fields.password.id}>New Password</Label>
        <Input
          {...getInputProps(fields.password, { type: "password" })}
          autoComplete="new-password"
        />
        <FormMessage id={fields.password.errorId}>
          {fields.password.errors}
        </FormMessage>
      </FormItem>

      <FormItem>
        <Label htmlFor={fields.confirmPassword.id}>Confirm Password</Label>
        <Input
          {...getInputProps(fields.confirmPassword, { type: "password" })}
          autoComplete="new-password"
        />
        <FormMessage id={fields.confirmPassword.errorId}>
          {fields.confirmPassword.errors}
        </FormMessage>
      </FormItem>

      <FormSubmit
        className="w-full"
        renderLoading={
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Changing password...
          </>
        }
      >
        Change Password
      </FormSubmit>
    </Form>
  )
}
