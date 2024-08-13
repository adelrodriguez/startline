"use client"

import {
  Form,
  FormItem,
  FormMessage,
  FormSubmit,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui"
import { checkEmailVerificationCode } from "@/server/actions"
import { createCheckEmailVerificationCodeSchema } from "@/utils/validation"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { useFormState } from "react-dom"

export default function CheckEmailVerificationCodeForm() {
  const [lastResult, action] = useFormState(
    checkEmailVerificationCode,
    undefined,
  )
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createCheckEmailVerificationCodeSchema(),
      })
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  // TODO(adelrodriguez): Add a link for resending the code
  return (
    <Form {...getFormProps(form)} action={action}>
      <FormItem className="flex flex-col items-center">
        <InputOTP
          {...getInputProps(fields.code, { type: "text" })}
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <FormMessage id={fields.code.errorId}>{fields.code.errors}</FormMessage>
      </FormItem>
      <FormSubmit className="w-full" renderLoading={<>Sending...</>}>
        Verify
      </FormSubmit>
    </Form>
  )
}
