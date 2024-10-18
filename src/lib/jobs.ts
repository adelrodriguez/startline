import "server-only"

import type { PublishRequest } from "@upstash/qstash"
import ky from "ky"
import type { NextRequest } from "next/server"
import type { z } from "zod"
import env from "~/lib/env.server"
import { AssertionError } from "~/lib/error"
import { StripeProcessWebhookEventPayloadSchema } from "~/lib/validation/jobs"
import qstash from "~/services/qstash"
import { buildUrl } from "~/utils/url"

const JobSchemaMap = {
  "stripe/process-webhook-event": StripeProcessWebhookEventPayloadSchema,
} as const

type JobType = keyof typeof JobSchemaMap
type JobPayload<T extends JobType> = z.infer<(typeof JobSchemaMap)[T]>

/**
 * This is a wrapper around the `qstash.publishJSON` function that allows you to
 * mock the request in development.
 *
 * Only use this for background jobs. If you need LLM responses, use `publishJSON`
 * directly (which you can't easily mock in development).
 */
export async function enqueueJob<T extends JobType>(
  type: T,
  payload: JobPayload<T>,
  options?: Pick<
    PublishRequest,
    | "contentBasedDeduplication"
    | "deduplicationId"
    | "delay"
    | "retries"
    | "timeout"
    | "notBefore"
  >,
) {
  const request = buildJobRequest(type, payload)

  if (!request.url) {
    throw new AssertionError("request.url is required")
  }

  if (env.MOCK_QSTASH) {
    console.log("Mocking QStash request", request)

    return ky.post(request.url, {
      json: request.body,
      retry: options?.retries,
    })
  }

  return qstash.publishJSON<JobPayload<T>>({
    ...request,
    ...options,
  })
}

export function buildJobRequest<T extends JobType>(
  type: T,
  payload: JobPayload<T>,
): PublishRequest<JobPayload<T>> {
  return {
    url: buildUrl(`/api/jobs/${type}`, {
      protocol: env.MOCK_QSTASH ? "http" : "https",
    }),
    body: payload,
  }
}

export async function parseJobRequest<T extends JobType>(
  type: T,
  request: Request | NextRequest,
): Promise<JobPayload<T>> {
  const payload = await request.json()

  const parsedPayload = JobSchemaMap[type].parse(payload)

  return parsedPayload
}
