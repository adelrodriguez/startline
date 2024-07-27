"use client"

import { resetPassword } from "@/server/actions"
import { NewPasswordSchema } from "@/utils/validation"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { useFormState } from "react-dom"

export default function NewPasswordForm({ token }: { token: string }) {
  const [lastResult, action] = useFormState(resetPassword, undefined)
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { token },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: NewPasswordSchema }),

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <form {...getFormProps(form)} action={action}>
      <input {...getInputProps(fields.token, { type: "hidden" })} />
      <div>
        <label>New Password</label>
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
      <button type="submit">Change Password</button>
    </form>
  )
}
