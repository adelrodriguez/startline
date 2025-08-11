"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useEffect } from "react"
import { toast } from "sonner"
import { inviteMember } from "~/server/actions/organization"
import type { OrganizationId } from "~/server/data/organization"
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
import { InviteMemberSchema } from "~/shared/validation/forms"

export default function InviteMemberForm({
  organizationId,
}: {
  organizationId: OrganizationId
}) {
  const { form, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(
      inviteMember.bind(null, organizationId),
      zodResolver(InviteMemberSchema),
      {
        formProps: { defaultValues: { email: "" } },
        actionProps: {
          onError({ error }) {
            toast.error(error.serverError)
          },
          onSuccess() {
            toast.success("Invitation sent!")
          },
        },
      }
    )

  useEffect(() => {
    if (!form.formState.isSubmitSuccessful) return

    resetFormAndAction()
  }, [form.formState.isSubmitSuccessful, resetFormAndAction])

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmitWithAction}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite a member</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="email" type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmit
          className="w-full"
          submittingMessage="Sending invitation..."
        >
          Invite
        </FormSubmit>
      </form>
    </Form>
  )
}
