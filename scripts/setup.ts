import fs from "node:fs/promises"
import { cancel, intro, isCancel, note, outro, select, spinner, text } from "@clack/prompts"

const s = spinner()

intro("Setting up your Next.js + Convex project")

s.start("Checking for environment configuration...")

const envExists = await fs.exists(".env")

if (envExists) {
  s.stop("Found .env file.")
} else {
  s.stop("No .env file found")

  const confirmation = await select({
    message: "Create environment file from template?",
    options: [
      { label: "Yes, copy .env.example to .env", value: true },
      { label: "No, I'll create it manually", value: false },
    ],
  })

  if (isCancel(confirmation)) {
    cancel("Setup cancelled.")
    process.exit(0)
  }

  if (confirmation) {
    s.start("Creating .env file...")
    await fs.copyFile(".env.example", ".env")
    s.stop("Created .env file")
    
    note(
      "Please update the following in your .env file:\n" +
      "• NEXT_PUBLIC_CONVEX_URL (from your Convex dashboard)\n" +
      "• NEXT_PUBLIC_CONVEX_SITE_URL (from your Convex dashboard)\n" +
      "• EMAIL_FROM (your sending email address)\n" +
      "• RESEND_API_KEY (if using Resend for emails)\n" +
      "• OAuth credentials (if using GitHub/Google auth)",
      "Environment Variables"
    )
  } else {
    note(
      "Make sure to create a .env file with the required variables.\n" +
      "Use .env.example as a reference.",
      "Manual Setup"
    )
  }
}

const convexSetup = await select({
  message: "Have you set up your Convex project?",
  options: [
    { label: "Yes, I have a Convex project ready", value: true },
    { label: "No, I need to set up Convex", value: false },
  ],
})

if (isCancel(convexSetup)) {
  cancel("Setup cancelled.")
  process.exit(0)
}

if (convexSetup) {
  note(
    "Great! Make sure your Convex URLs are in your .env file:\n" +
    "• NEXT_PUBLIC_CONVEX_URL\n" +
    "• NEXT_PUBLIC_CONVEX_SITE_URL",
    "Convex Configuration"
  )
} else {
  note(
    "To set up Convex:\n" +
    "1. Visit https://convex.dev and create an account\n" +
    "2. Create a new project\n" +
    "3. Run 'bunx convex dev' to initialize\n" +
    "4. Copy the URLs to your .env file",
    "Convex Setup Required"
  )
}

outro("Setup complete! Run 'bun dev' to start developing.")
