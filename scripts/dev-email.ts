import { $ } from "bun"

// We need to copy the .env file to the react-email package so that it can read the env vars
await $`cp .env ./node_modules/react-email/`
await $`bun email dev --dir src/components/emails --port 3001`