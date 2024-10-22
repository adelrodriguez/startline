"use client"

import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { useAction } from "next-safe-action/hooks"
import { type ComponentRef, useActionState, useRef } from "react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Form, FormItem, FormMessage, FormSubmit } from "~/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp"
import { createCheckEmailVerificationCodeSchema } from "~/lib/validation/forms"
import {
  checkEmailVerificationCode,
  resendEmailVerificationCode,
} from "~/server/actions/auth"

export default function CheckEmailVerificationCodeForm() {
  const formRef = useRef<ComponentRef<typeof Form>>(null)
  const [lastResult, action] = useActionState(
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
      <ResendCodeButton />
      <FormMessage id={fields.code.errorId}>{form.errors?.[0]}</FormMessage>

      <FormSubmit className="w-full" renderLoading={<>Sending...</>}>
        Verify
      </FormSubmit>
    </Form>
  )
}

function ResendCodeButton() {
  const { execute } = useAction(resendEmailVerificationCode, {
    onExecute() {
      toast.loading("Sending code...", { id: "resend-code" })
    },
    onSuccess() {
      toast.success("Code sent", { id: "resend-code" })
    },
    onError(error) {
      toast.error(error.error.serverError)
    },
  })

  return (
    <Button onClick={() => execute()} variant="link">
      Resend code
    </Button>
  )
}
