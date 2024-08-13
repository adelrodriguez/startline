"use client"

import {
  Button,
  Form,
  FormItem,
  FormMessage,
  FormSubmit,
  Input,
  Label,
} from "@/components/ui"
import { signInWithPassword } from "@/server/actions"
import { createSignInWithPasswordSchema } from "@/utils/validation"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { useFormState } from "react-dom"

export default function SignInForm() {
  const [lastResult, action] = useFormState(signInWithPassword, undefined)
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createSignInWithPasswordSchema(),
      })
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

      <FormItem>
        <Label htmlFor={fields.password.id}>Password</Label>
        <div className="space-y-0.5">
          <Input
            {...getInputProps(fields.password, { type: "password" })}
            autoComplete="password"
          />

          <Button variant="link" asChild className="p-0">
            <Link href="/sign-in/reset-password">Forgot password?</Link>
          </Button>
        </div>
      </FormItem>

      <FormMessage className="text-center">{form.errors}</FormMessage>

      <FormSubmit
        className="w-full"
        renderLoading={
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        }
      >
        Sign in
      </FormSubmit>
    </Form>
  )
}
