"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormSubmit,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { SignInWithCodeSchema } from "~/lib/validation/forms"
import { signInWithCode } from "~/server/actions/auth"

export default function SignInWithCodeForm() {
  const { form, handleSubmitWithAction } = useHookFormAction(
    signInWithCode,
    zodResolver(SignInWithCodeSchema),
    {
      formProps: { defaultValues: { email: "" } },
    }
  )

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmitWithAction}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="email" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormSubmit className="w-full" submittingMessage="Sending...">
          Send a sign in code
        </FormSubmit>
      </form>
    </Form>
  )
}
