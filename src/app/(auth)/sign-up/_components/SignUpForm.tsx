"use client"

import { signUp } from "@/server/actions"
import { SignUpSchema } from "@/utils/validation"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { useFormState } from "react-dom"

export default function SignUpForm() {
  const [lastResult, action] = useFormState(signUp, undefined)
  const [form, fields] = useForm({
    lastResult,

    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: SignUpSchema }),

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
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
      <div>
        <label>Confirm Password</label>
        <input
          {...getInputProps(fields.confirmPassword, { type: "password" })}
        />
        <div>{fields.confirmPassword.errors}</div>
      </div>
      <button type="submit">Sign Up</button>
    </form>
  )
}
