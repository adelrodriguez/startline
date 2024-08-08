"use client"

import { Form, FormItem, FormSubmit, Input, Label } from "@/components/ui"
import { requestPasswordReset } from "@/server/actions"
import { RequestPasswordResetSchema } from "@/utils/validation"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Loader2 } from "lucide-react"
import { useFormState } from "react-dom"

export default function ResetPasswordForm() {
  const [lastResult, action] = useFormState(requestPasswordReset, undefined)
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RequestPasswordResetSchema })
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <Form {...getFormProps(form)} action={action}>
      <FormItem>
        <Label htmlFor={fields.email.id}>Email address</Label>

        <Input
          {...getInputProps(fields.email, { type: "email" })}
          autoComplete="email"
        />
      </FormItem>

      <FormSubmit
        className="w-full"
        renderLoading={
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        }
      >
        Send
      </FormSubmit>
    </Form>
  )
}
