import React from "react"
import { cn } from "~/utils/ui"

const TypographyH1 = React.forwardRef<
  React.ComponentRef<"h1">,
  React.ComponentPropsWithoutRef<"h1">
>(({ className, ...props }, ref) => (
  <h1
    className={cn(
      "scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl",
      className
    )}
    ref={ref}
    {...props}
  />
))
TypographyH1.displayName = "TypographyH1"

const TypographyH2 = React.forwardRef<
  React.ComponentRef<"h2">,
  React.ComponentPropsWithoutRef<"h2">
>(({ className, ...props }, ref) => (
  <h2
    className={cn(
      "scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0",
      className
    )}
    ref={ref}
    {...props}
  />
))
TypographyH2.displayName = "TypographyH2"

const TypographyH3 = React.forwardRef<
  React.ComponentRef<"h3">,
  React.ComponentPropsWithoutRef<"h3">
>(({ className, ...props }, ref) => (
  <h3
    className={cn(
      "scroll-m-20 font-semibold text-2xl tracking-tight",
      className
    )}
    ref={ref}
    {...props}
  />
))
TypographyH3.displayName = "TypographyH3"

const TypographyH4 = React.forwardRef<
  React.ComponentRef<"h4">,
  React.ComponentPropsWithoutRef<"h4">
>(({ className, ...props }, ref) => (
  <h4
    className={cn(
      "scroll-m-20 font-semibold text-xl tracking-tight",
      className
    )}
    ref={ref}
    {...props}
  />
))
TypographyH4.displayName = "TypographyH4"

const TypographyP = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
    ref={ref}
    {...props}
  />
))
TypographyP.displayName = "TypographyP"

const TypographyBlockquote = React.forwardRef<
  React.ComponentRef<"blockquote">,
  React.ComponentPropsWithoutRef<"blockquote">
>(({ className, ...props }, ref) => (
  <blockquote
    className={cn("mt-6 border-l-2 pl-6 italic", className)}
    ref={ref}
    {...props}
  />
))
TypographyBlockquote.displayName = "TypographyBlockquote"

const TypographyList = React.forwardRef<
  React.ComponentRef<"ul">,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
    ref={ref}
    {...props}
  />
))
TypographyList.displayName = "TypographyList"

const TypographyInlineCode = React.forwardRef<
  React.ComponentRef<"code">,
  React.ComponentPropsWithoutRef<"code">
>(({ className, ...props }, ref) => (
  <code
    className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm",
      className
    )}
    ref={ref}
    {...props}
  />
))
TypographyInlineCode.displayName = "TypographyInlineCode"

const TypographyLead = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-muted-foreground text-xl", className)}
    ref={ref}
    {...props}
  />
))
TypographyLead.displayName = "TypographyLead"

const TypographyLarge = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    className={cn("font-semibold text-lg", className)}
    ref={ref}
    {...props}
  />
))
TypographyLarge.displayName = "TypographyLarge"

const TypographySmall = React.forwardRef<
  React.ComponentRef<"small">,
  React.ComponentPropsWithoutRef<"small">
>(({ className, ...props }, ref) => (
  <small
    className={cn("font-medium text-sm leading-none", className)}
    ref={ref}
    {...props}
  />
))
TypographySmall.displayName = "TypographySmall"

const TypographyMuted = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    className={cn("text-muted-foreground text-sm", className)}
    ref={ref}
    {...props}
  />
))
TypographyMuted.displayName = "TypographyMuted"

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyList,
  TypographyInlineCode,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
}
