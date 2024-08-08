"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/utils/ui"
import * as React from "react"
import { useFormStatus } from "react-dom"

const Form = React.forwardRef<
  HTMLFormElement,
  React.HTMLAttributes<HTMLFormElement> &
    React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => {
  return <form ref={ref} className={cn("space-y-4", className)} {...props} />
})

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />
})
FormItem.displayName = "FormItem"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { children?: string | string[] }
>(({ className, children, ...props }, ref) => {
  const body = Array.isArray(children) ? children[0] : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn("font-medium text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

const FormSubmit = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "type"> & {
    renderLoading?: React.ReactNode
  }
>(({ className, children, renderLoading, ...props }, ref) => {
  const { pending } = useFormStatus()

  return (
    <Button
      ref={ref}
      type="submit"
      className={cn("w-full", className)}
      disabled={pending}
      aria-disabled={pending}
      {...props}
    >
      {pending ? renderLoading ?? children : children}
    </Button>
  )
})
FormSubmit.displayName = "FormSubmit"

export { Form, FormItem, FormDescription, FormMessage, FormSubmit }
