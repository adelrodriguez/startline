"use client"

import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { useFormState } from "react-dom"
import { Form, FormItem, FormSubmit, Input, Label } from "~/components/ui"
import { InviteMemberSchema } from "~/lib/validation"
import { inviteMember } from "~/server/actions/organization"
import type { OrganizationId } from "~/server/data/organization"

export default function InviteMemberForm({
  organizationId,
}: { organizationId: OrganizationId }) {
  const [lastResult, action] = useFormState(inviteMember, undefined)
  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      organizationId,
      role: "member",
    },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: InviteMemberSchema }),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <Form {...getFormProps(form)} action={action}>
      <input {...getInputProps(fields.organizationId, { type: "hidden" })} />
      <input {...getInputProps(fields.role, { type: "hidden" })} />
      <FormItem>
        <Label htmlFor={fields.email.id}>Invite a member</Label>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input {...getInputProps(fields.email, { type: "email" })} />
          <FormSubmit>Invite</FormSubmit>
        </div>
      </FormItem>
    </Form>
  )
}
