"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { useAction } from "next-safe-action/hooks"
import { type ComponentRef, useRef } from "react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormSubmit,
} from "~/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp"
import { CheckSignInWithCodeSchema } from "~/lib/validation/forms"
import { checkSignInCode, resendSignInCode } from "~/server/actions/auth"

export default function CheckSignInCodeForm({ email }: { email: string }) {
  const formRef = useRef<ComponentRef<"form">>(null)
  const { form, handleSubmitWithAction } = useHookFormAction(
    checkSignInCode,
    zodResolver(CheckSignInWithCodeSchema),
  )
  const { execute: resendCode } = useAction(resendSignInCode, {
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
    <Form {...form}>
      <form
        onSubmit={handleSubmitWithAction}
        className="space-y-4"
        ref={formRef}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormControl>
                <InputOTP
                  {...field}
                  type="text"
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
              </FormControl>
              <Button
                onClick={() => resendCode({ email })}
                variant="link"
                type="button"
              >
                Resend code
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit className="w-full" submittingMessage="Verifying...">
          Verify
        </FormSubmit>
      </form>
    </Form>
  )
}
