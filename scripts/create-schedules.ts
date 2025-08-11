import { intro, log, outro, spinner } from "@clack/prompts"
import type { CreateScheduleRequest } from "@upstash/qstash"
import qstash from "~/services/qstash"
import { buildUrl } from "~/utils/url"

const schedules = qstash.schedules

function buildScheduleUrl(name: string) {
  return buildUrl(`/api/cron/${name}`)
}

const endpoints: CreateScheduleRequest[] = [
  {
    destination: buildScheduleUrl("clean-expired-codes"),
    cron: "0 0 * * *",
  },
]

intro("Creating schedules")

const s = spinner()
s.start("Fetching existing schedules")

const existingSchedules = await schedules.list()

s.stop("Existing schedules fetched")

for (const endpoint of endpoints) {
  if (
    existingSchedules.find(
      (schedule) => schedule.destination === endpoint.destination
    )
  ) {
    log.warn(`Schedule already exists: ${endpoint.destination}`)
    continue
  }

  s.start(`Creating schedule for ${endpoint.destination}`)
  await schedules.create(endpoint)
  s.stop(`Schedule created for ${endpoint.destination}`)
}

outro("All schedules created successfully")
