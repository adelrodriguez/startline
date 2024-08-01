import { $ } from "bun"

// We need to copy the .env file to the react-email package so that it can read
// the env vars See: https://github.com/resend/react-email/issues/668
await $`cp .env ./node_modules/react-email/`
