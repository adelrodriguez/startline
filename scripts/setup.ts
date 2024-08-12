import fs from "node:fs/promises"
import { cancel, intro, isCancel, outro, select, spinner } from "@clack/prompts"
import { $ } from "bun"

const s = spinner()

intro("Setting up the `startline` template")

s.start("Checking for a .env.local file...")

const envLocalExists = await fs.exists(".env.local")

if (envLocalExists) {
  s.stop("Found .env.local file.")
} else {
  s.stop("No .env.local file found")

  const confirmation = await select({
    message:
      "Do you want to create a .env.local file? This will copy the .env.example file to .env.local.",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  })

  if (isCancel(confirmation)) {
    cancel("Cancelled setup.")

    process.exit(0)
  }

  if (!confirmation) {
    cancel(
      "Please create a .env.local following the template of the .env.example file.",
    )

    process.exit(0)
  } else {
    s.start("Creating .env.local file...")

    await fs.copyFile(".env.example", ".env.local")

    s.stop("Created .env.local file")
  }
}

// TODO(adelrodriguez): Run script that prompts user to create the necessary
// accounts and fill environment variables.

const hasDocker = await select({
  message:
    "Do you have Docker installed? We use Docker for running the database, the Redis server, and the Inngest server for local development.",
  options: [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ],
})

if (isCancel(hasDocker)) {
  cancel("Cancelled setup.")

  process.exit(0)
}

if (!hasDocker) {
  cancel("Please install Docker before continuing.")
  process.exit(0)
} else {
  s.start("Starting Docker containers...")
  await $`bun docker:up`
  s.stop("Docker containers started.")
}

outro("Finished setup. Happy coding!")
