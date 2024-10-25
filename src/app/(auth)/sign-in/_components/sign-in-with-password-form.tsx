"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import Link from "next/link"

import { Button } from "~/components/ui/button"
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
import { SignInWithPasswordSchema } from "~/lib/validation/forms"
import { signInWithPassword } from "~/server/actions/auth"

export default function SignInForm() {
  const { form, handleSubmitWithAction } = useHookFormAction(
    signInWithPassword,
    zodResolver(SignInWithPasswordSchema),
    { formProps: { defaultValues: { email: "", password: "" } } },
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" autoComplete="password" />
              </FormControl>
              <Button variant="link" asChild className="p-0">
                <Link href="/sign-in/reset-password" className="h-auto">
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
