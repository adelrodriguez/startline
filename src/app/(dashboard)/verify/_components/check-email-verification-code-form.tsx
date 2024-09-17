"use client"

import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { type ElementRef, useRef } from "react"
import { useFormState } from "react-dom"
import {
  Button,
  Form,
  FormItem,
  FormMessage,
  FormSubmit,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui"
import { createCheckEmailVerificationCodeSchema } from "~/lib/validation/forms"
import {
  checkEmailVerificationCode,
  resendEmailVerificationCode,
} from "~/server/actions/auth"

export default function CheckEmailVerificationCodeForm() {
  const formRef = useRef<ElementRef<typeof Form>>(null)
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

  return (
    <Form {...getFormProps(form)} action={action} ref={formRef}>
      <FormItem className="flex flex-col items-center">
        <InputOTP
          {...getInputProps(fields.code, { type: "text" })}
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          onComplete={() => {
            formRef?.current?.requestSubmit()
          }}
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
      </FormItem>
      <Button onClick={() => resendEmailVerificationCode()} variant="link">
        Resend code
      </Button>
      <FormMessage id={fields.code.errorId}>{form.errors?.[0]}</FormMessage>

      <FormSubmit className="w-full" renderLoading={<>Sending...</>}>
        Verify
      </FormSubmit>
    </Form>
  )
}
