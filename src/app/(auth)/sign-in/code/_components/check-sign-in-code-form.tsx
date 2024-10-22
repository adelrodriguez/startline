"use client"

import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { Loader2Icon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { type ComponentRef, useActionState, useRef } from "react"
import { toast } from "sonner"

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
import { createCheckInWithCodeSchema } from "~/lib/validation/forms"
import { checkSignInCode, resendSignInCode } from "~/server/actions/auth"

export default function CheckSignInCodeForm({ email }: { email: string }) {
  const formRef = useRef<ComponentRef<typeof Form>>(null)
  const [lastResult, action] = useActionState(checkSignInCode, undefined)
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createCheckInWithCodeSchema() })
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onBlur",
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
      <ResendCodeButton email={email} />
      <FormMessage id={fields.code.errorId}>{fields.code.errors}</FormMessage>
      <FormSubmit
        className="w-full"
        renderLoading={
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        }
      >
        Verify
      </FormSubmit>
    </Form>
  )
}

function ResendCodeButton({ email }: { email: string }) {
  const { execute } = useAction(resendSignInCode, {
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
    <Button onClick={() => execute({ email })} variant="link">
      Resend code
    </Button>
  )
}
