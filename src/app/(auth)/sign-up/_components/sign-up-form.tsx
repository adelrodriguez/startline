"use client"

import {
  Form,
  FormItem,
  FormMessage,
  FormSubmit,
  Input,
  Label,
} from "@/components/ui"
import { createSignUpSchema } from "@/lib/validation"
import { signUp } from "@/server/actions/auth"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Loader2Icon } from "lucide-react"
import { useFormState } from "react-dom"

export default function SignUpForm() {
  const [lastResult, action] = useFormState(signUp, undefined)
  const [form, fields] = useForm({
    lastResult,

    onValidate: ({ formData }) =>
      parseWithZod(formData, {
        schema: (intent) => createSignUpSchema(intent),
      }),

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <Form {...getFormProps(form)} action={action}>
      <FormItem>
        <Label htmlFor={fields.email.id}>Email</Label>
        <Input
          {...getInputProps(fields.email, { type: "email" })}
          autoComplete="email"
        />
        <FormMessage id={fields.email.errorId}>
          {fields.email.errors}
        </FormMessage>
      </FormItem>

      <FormItem>
        <Label htmlFor={fields.password.id}>Password</Label>
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
            Signing up...
          </>
        }
      >
        Sign Up
      </FormSubmit>
    </Form>
  )
}
