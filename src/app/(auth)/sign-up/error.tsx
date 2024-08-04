"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <button onClick={reset} type="button">
        Try again
      </button>
    </div>
  )
}
