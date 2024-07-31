"server-only"

import inngest from "@/services/inngest"
import type { GetEvents } from "inngest"
import { validateRequest } from "@/lib/auth"
import { getTime } from "date-fns"
import { InngestError } from "@/utils/error"

type Events = GetEvents<typeof inngest>

export async function triggerJob<T extends keyof Events>(
  name: T,
  data: Events[T]["data"],
  opts?: {
    idempotencyKey?: string
    runAt?: Date
  },
) {
  const { user } = await validateRequest()

  const { ids } = await inngest.send({
    name,
    data,
    ...(opts?.runAt ? { ts: getTime(opts.runAt) } : {}),
    ...(user ? { user: { external_id: user.id } } : {}),
    ...(opts?.idempotencyKey ? { id: opts.idempotencyKey } : {}),
  })

  if (!ids[0]) {
    throw new InngestError("No ID returned from Inngest")
  }

  return ids[0]
}

export async function triggerJobs(
  jobs: {
    name: Parameters<typeof triggerJob>[0]
    data: Parameters<typeof triggerJob>[1]
    opts?: Parameters<typeof triggerJob>[2]
  }[],
) {
  const { user } = await validateRequest()

  const { ids } = await inngest.send(
    jobs.map(({ name, data, opts }) => {
      return {
        name,
        data,
        ...(opts?.runAt ? { ts: getTime(opts.runAt) } : {}),
        ...(user ? { user: { external_id: user.id } } : {}),
        ...(opts?.idempotencyKey ? { id: opts.idempotencyKey } : {}),
      }
    }),
  )

  return ids
}
