"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/server/actions/auth"
import { Loader2Icon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"

export default function SignOutButton() {
  const { execute, isPending } = useAction(signOut)

  return (
    <Button variant="default" onClick={() => execute()} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  )
}
