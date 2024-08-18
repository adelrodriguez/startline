import qstash from "@/services/qstash"
import { buildUrl } from "@/utils/url"

const schedules = qstash.schedules

function buildScheduleUrl(name: string) {
  return buildUrl(`/api/cron/${name}`)
}

await schedules.create({
  destination: buildScheduleUrl("clean-password-reset-tokens"),
  cron: "0 0 * * *",
})

await schedules.create({
  destination: buildScheduleUrl("clean-email-verification-codes"),
  cron: "0 0 * * *",
})

await schedules.create({
  destination: buildScheduleUrl("clean-sign-in-codes"),
  cron: "0 0 * * *",
})
