"use client"

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
} from "@/components/ui"
import { checkSignInCode, resendSignInCode } from "@/server/actions"
import { createCheckInWithCodeSchema } from "@/utils/validation"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { type ElementRef, useRef } from "react"
import { useFormState } from "react-dom"

export default function CheckSignInCodeForm({ email }: { email: string }) {
  const formRef = useRef<ElementRef<typeof Form>>(null)
  const [lastResult, action] = useFormState(checkSignInCode, undefined)
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createCheckInWithCodeSchema() })
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
      <Button onClick={() => resendSignInCode(email)} variant="link">
        Resend code
      </Button>
      <FormMessage id={fields.code.errorId}>{fields.code.errors}</FormMessage>
      <FormSubmit className="w-full" renderLoading={<>Sending...</>}>
        Verify
      </FormSubmit>
    </Form>
  )
}
