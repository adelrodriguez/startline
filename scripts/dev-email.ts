import { $ } from "bun"
import { intro, outro, spinner } from "@clack/prompts"

intro("Setting up email development server")

const s = spinner()

// We need to copy the .env file to the react-email package so that it can read
// the env vars See: https://github.com/resend/react-email/issues/668
s.start("Copying .env to react-email package...")

await $`cp .env ./node_modules/react-email/`

s.stop("Copied .env to react-email package")

outro("Starting email development server...")
