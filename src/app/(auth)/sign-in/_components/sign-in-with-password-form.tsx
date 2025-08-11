"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import Link from "next/link"
import { signInWithPassword } from "~/server/actions/auth"
import { Button } from "~/shared/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormSubmit,
} from "~/shared/components/ui/form"
import { Input } from "~/shared/components/ui/input"
import { SignInWithPasswordSchema } from "~/shared/validation/forms"

export default function SignInForm() {
  const { form, handleSubmitWithAction } = useHookFormAction(
    signInWithPassword,
    zodResolver(SignInWithPasswordSchema),
    { formProps: { defaultValues: { email: "", password: "" } } }
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
                <Input {...field} autoComplete="email" type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="password" type="password" />
              </FormControl>
              <Button asChild className="p-0" variant="link">
                <Link className="h-auto" href="/sign-in/reset-password">
                  Forgot password?
                </Link>
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit className="w-full" submittingMessage="Signing in...">
          Sign in
        </FormSubmit>
      </form>
    </Form>
  )
}
