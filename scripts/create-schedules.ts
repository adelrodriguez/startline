import type { CreateScheduleRequest } from "@upstash/qstash"
import chalk from "chalk"
import qstash from "~/services/qstash"
import { buildUrl } from "~/utils/url"

const schedules = qstash.schedules

function buildScheduleUrl(name: string) {
  return buildUrl(`/api/cron/${name}`)
}

const endpoints: CreateScheduleRequest[] = [
  {
    destination: buildScheduleUrl("clean-password-reset-tokens"),
    cron: "0 0 * * *",
  },
  {
    destination: buildScheduleUrl("clean-email-verification-codes"),
    cron: "0 0 * * *",
  },
  { destination: buildScheduleUrl("clean-sign-in-codes"), cron: "0 0 * * *" },
]

const existingSchedules = await schedules.list()

for (const endpoint of endpoints) {
  if (
    existingSchedules.find(
      (schedule) => schedule.destination === endpoint.destination,
    )
  ) {
    console.log(chalk.yellow("Schedule already exists:"), endpoint.destination)
    continue
  }

  await schedules.create(endpoint)
}
