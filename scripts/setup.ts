import { $ } from "bun"
import fs from "node:fs/promises"
import { cancel, intro, isCancel, outro, select, spinner } from "@clack/prompts"

const s = spinner()

intro("Setting up the `startline` template")

s.start("Checking for a .env file...")

const envLocalExists = await fs.exists(".env")

if (envLocalExists) {
  s.stop("Found .env file.")
} else {
  s.stop("No .env file found")

  const confirmation = await select({
    message:
      "Do you want to create a .env file? This will copy the .env.example file to .env.",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  })

  if (isCancel(confirmation)) {
    cancel("Cancelled setup.")

    process.exit(0)
  }

  if (confirmation) {
    s.start("Creating .env file...")

    await fs.copyFile(".env.example", ".env")

    s.stop("Created .env file")
  } else {
    cancel(
      "Please create a .env following the template of the .env.example file."
    )

    process.exit(0)
  }
}

// TODO(adelrodriguez): Run script that prompts user to create the necessary
// accounts and fill environment variables.

const hasDocker = await select({
  message:
    "Do you have Docker installed? We use Docker for running the database and the Redis server for local development.",
  options: [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ],
})

if (isCancel(hasDocker)) {
  cancel("Cancelled setup.")

  process.exit(0)
}

if (hasDocker) {
  s.start("Starting Docker containers...")
  await $`bun docker:up`
  s.stop("Docker containers started.")
} else {
  cancel("Please install Docker before continuing.")
  process.exit(0)
}

outro("Finished setup. Happy coding!")
