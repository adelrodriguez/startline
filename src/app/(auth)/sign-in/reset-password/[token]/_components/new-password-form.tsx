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
import { NewPasswordSchema } from "~/lib/validation/forms"
import { resetPassword } from "~/server/actions/auth"

export default function NewPasswordForm({ token }: { token: string }) {
  const { form, handleSubmitWithAction } = useHookFormAction(
    resetPassword.bind(null, token),
    zodResolver(NewPasswordSchema),
    {
      formProps: { defaultValues: { password: "", confirmPassword: "" } },
    },
  )

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit className="w-full" submittingMessage="Changing password...">
          Change Password
        </FormSubmit>
      </form>
    </Form>
  )
}
