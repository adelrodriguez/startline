"use client"

import { signInWithPassword } from "@/server/actions"
import { SignInSchema } from "@/utils/validation"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import Link from "next/link"
import { useFormState } from "react-dom"

export default function SignInForm() {
  const [lastResult, action] = useFormState(signInWithPassword, undefined)
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignInSchema })
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <>
      <form {...getFormProps(form)} action={action}>
        <div>
          <label>Email</label>
          <input {...getInputProps(fields.email, { type: "email" })} />
          <div>{fields.email.errors}</div>
        </div>
        <div>
          <label>Password</label>
          <input {...getInputProps(fields.password, { type: "password" })} />
          <div>{fields.password.errors}</div>
        </div>
        {form.errors && form.errors.length > 0 && (
          <div className="text-red-500">{form.errors.join(", ")}</div>
        )}
        <button type="submit">Sign In</button>
      </form>
      <Link href="/api/sign-in/google">Sign in with Google</Link>
    </>
  )
}
