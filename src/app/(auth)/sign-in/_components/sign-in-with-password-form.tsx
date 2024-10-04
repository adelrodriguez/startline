"use client"

import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { useFormState } from "react-dom"
import { Button } from "~/components/ui/button"
import { Form, FormItem, FormMessage, FormSubmit } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { createSignInWithPasswordSchema } from "~/lib/validation/forms"
import { signInWithPassword } from "~/server/actions/auth"

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
