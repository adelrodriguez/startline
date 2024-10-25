"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmit,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { RequestPasswordResetSchema } from "~/lib/validation/forms"
import { requestPasswordReset } from "~/server/actions/auth"

export default function ResetPasswordForm() {
  const { form, handleSubmitWithAction } = useHookFormAction(
    requestPasswordReset,
    zodResolver(RequestPasswordResetSchema),
    { formProps: { defaultValues: { email: "" } } },
  )

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input {...field} type="email" autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit className="w-full" submittingMessage="Sending request...">
          Send request
        </FormSubmit>
      </form>
    </Form>
  )
}
