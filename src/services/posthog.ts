import { PostHog } from "posthog-node"
import env from "~/lib/env.client"

export function getPostHog() {
  return new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
}

export function withPostHog<T>(callback: (posthog: PostHog) => T): T
export async function withPostHog<T>(
  callback: (posthog: PostHog) => Promise<T>,
): Promise<T> {
  const posthog = getPostHog()

  try {
    const result = await callback(posthog)

    return result
  } finally {
    await posthog.shutdown()
  }
}
