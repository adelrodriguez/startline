import fs from "node:fs/promises"
import { MOCK_RESEND_EMAIL } from "@/lib/consts"
import {
  cancel,
  group,
  intro,
  log,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts"
import { z } from "zod"

const s = spinner()

intro("Setting up the `startline` template")

s.start("Checking for a .env.local file...")

const envLocalExists = await fs.exists(".env.local")

if (envLocalExists) {
  s.stop("Found .env.local file")
} else {
  s.stop("No .env.local file found")

  const confirmation = await select({
    message: "Do you want to create a .env.local file?",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  })

  if (!confirmation) {
    cancel(
      "Please create a .env.local file by running the command: `touch .env.local`",
    )

    process.exit(0)
  } else {
    s.start("Creating .env.local file...")

    await fs.writeFile(".env.local", "")

    s.stop("Created .env.local file")
  }
}

log.info("Setting up environment variables")

const env = await group(
  {
    BASE_URL: () =>
      text({
        message: "What is your base URL?",
        placeholder: "Set a url for your BASE_URL environment variable",
        initialValue: "http://localhost:3000",
        validate(value) {
          const result = z.string().url().safeParse(value)

          if (!result.success) {
            return "You must provide a valid URL"
          }
        },
      }),
    EMAIL_FROM: () =>
      text({
        message:
          "What is your email address? This is the address that will be used to send emails. For development, emails can be mocked so this doesn't have to be a real email address.",
        placeholder:
          "Set a email address for your EMAIL_FROM environment variable",
        initialValue: "noreply@mail.startline.dev",
        validate(value) {
          const result = z.string().email().safeParse(value)

          if (!result.success) {
            return "You must provide a correctly formatted email address"
          }
        },
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)
await setEnvironmentVariables(env)

log.info("Setting up environment variables for GitHub OAuth")

const githubEnvs = await group(
  {
    GITHUB_CLIENT_ID: () =>
      text({
        message:
          "What is your GitHub client ID? This is used to authenticate users with GitHub. You can leave this blank if you are not using GitHub authentication.",
        placeholder: "MY_GITHUB_CLIENT_ID",
        initialValue: "",
      }),
    GITHUB_CLIENT_SECRET: () =>
      text({
        message:
          "What is your GitHub client secret? This is used to authenticate users with GitHub. You can leave this blank if you are not using GitHub authentication.",
        placeholder: "MY_GITHUB_CLIENT_SECRET",
        initialValue: "",
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)

s.start("Saving GitHub environment variables...")
await setEnvironmentVariables(githubEnvs)
s.stop("Done")

log.info("Setting up environment variables for Google OAuth")

const googleEnvs = await group(
  {
    GOOGLE_CLIENT_ID: () =>
      text({
        message:
          "What is your Google client ID? This is used to authenticate users with Google. You can leave this blank if you are not using Google authentication.",
        placeholder: "MY_GOOGLE_CLIENT_ID",
        initialValue: "",
      }),
    GOOGLE_CLIENT_SECRET: () =>
      text({
        message:
          "What is your Google client secret? This is used to authenticate users with Google. You can leave this blank if you are not using Google authentication.",
        placeholder: "MY_GOOGLE_CLIENT_SECRET",
        initialValue: "",
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)
s.start("Saving Google environment variables...")
await setEnvironmentVariables(googleEnvs)
s.stop("Done")

log.info("Setting up environment variables for Inngest")

const inngestEnvs = await group(
  {
    INNGEST_SIGNING_KEY: () =>
      text({
        message:
          "What is your Inngest signing key? You can leave this blank for local development.",
        placeholder: "MY_INNGEST_SIGNING_KEY",
        initialValue: "",
      }),
    INNGEST_SIGNING_KEY_FALLBACK: () =>
      text({
        message:
          "What is your Inngest signing key fallback? You can leave this blank for local development.",
        placeholder: "MY_INNGEST_SIGNING_KEY_FALLBACK",
        initialValue: "",
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)
s.start("Saving Inngest environment variables...")
await setEnvironmentVariables(inngestEnvs)
s.stop("Done")

s.start("Saving Resend environment variables...")
await setEnvironmentVariable("RESEND_API_KEY", MOCK_RESEND_EMAIL)
s.stop("Done")

log.info(
  "Setting up environment variables for Sentry. Go to https://sentry.io/ to set up your project.",
)

const sentryEnvs = await group(
  {
    SENTRY_DSN: () =>
      text({
        message: "What is your Sentry DSN?",
        placeholder: "MY_SENTRY_DSN",
        initialValue: "",
      }),
    SENTRY_ORG: () =>
      text({
        message: "What is your Sentry organization?",
        placeholder: "MY_SENTRY_ORG",
        initialValue: "",
      }),
    SENTRY_PROJECT: () =>
      text({
        message: "What is your Sentry project?",
        placeholder: "MY_SENTRY_PROJECT",
        initialValue: "",
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)

s.start("Saving Sentry environment variables...")
await setEnvironmentVariables(sentryEnvs)
await setEnvironmentVariable("NEXT_PUBLIC_SENTRY_DSN", sentryEnvs.SENTRY_DSN)
s.stop("Done")

log.info(
  "Setting up environment variables for Stripe. See https://stripe.com/docs/keys for more information.",
)

const stripeEnvs = await group(
  {
    STRIPE_SECRET_KEY: () =>
      text({
        message: "What is your Stripe secret key?",
        placeholder: "MY_STRIPE_SECRET_KEY",
        initialValue: "",
      }),
    STRIPE_WEBHOOK_SECRET: () =>
      text({
        message: "What is your Stripe webhook secret?",
        placeholder: "MY_STRIPE_WEBHOOK_SECRET",
        initialValue: "",
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)

s.start("Saving Stripe environment variables...")
await setEnvironmentVariables(stripeEnvs)
s.stop("Done")

log.info(
  "Setting up environment variables for UploadThing. Go to https://uploadthing.com/ to create an account.",
)

const uploadThingEnvs = await group(
  {
    UPLOADTHING_SECRET: () =>
      text({
        message: "What is your UploadThing secret?",
        placeholder: "MY_UPLOADTHING_SECRET",
        initialValue: "sk_",
      }),
    UPLOADTHING_APP_ID: () =>
      text({
        message: "What is your UploadThing app ID?",
        placeholder: "MY_UPLOADTHING_APP_ID",
        initialValue: "",
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)
s.start("Saving UploadThing environment variables...")
await setEnvironmentVariables(uploadThingEnvs)
s.stop("Done")

s.start("Setting up database environment variables...")
await setEnvironmentVariable("DATABASE_URL", "http://127.0.0.1:8080")
s.stop("Done")

log.info("Setting up environment variables for Redis")
await setEnvironmentVariable("UPSTASH_REDIS_REST_URL", "http://localhost:8079")
await setEnvironmentVariable("UPSTASH_REDIS_REST_TOKEN", "my-redis-rest-token")

log.info("Setting up environment variables for PostHog Analytics")

const postHogEnvs = await group(
  {
    NEXT_PUBLIC_POSTHOG_KEY: () =>
      text({
        message: "What is your PostHog key?",
        placeholder: "MY_POSTHOG_KEY",
        initialValue: "",
      }),
    NEXT_PUBLIC_POSTHOG_HOST: () =>
      text({
        message: "What is your PostHog host?",
        placeholder: "MY_POSTHOG_HOST",
        initialValue: "",
      }),
  },
  {
    onCancel: () => {
      cancel("Cancelled setup.")
      process.exit(0)
    },
  },
)

s.start("Saving PostHog environment variables...")
await setEnvironmentVariables(postHogEnvs)
s.stop("Done")

// Do stuff
outro(`You're all set!`)

async function setEnvironmentVariables(env: Record<string, string>) {
  for (const [key, value] of Object.entries(env)) {
    await setEnvironmentVariable(key, value)
  }
}

async function setEnvironmentVariable(name: string, value: string) {
  await fs.appendFile(".env.local", `${name}="${value ?? ""}"\n`)
}
