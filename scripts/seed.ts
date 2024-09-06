import db, { user, profile, organization, account, password } from "@/server/db"
import {
  cancel,
  isCancel,
  log,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts"
import { faker } from "@faker-js/faker"
import { hash } from "@node-rs/argon2"
import { z } from "zod"

const s = spinner()

// Get confirmation before seeding
const confirmation = await select({
  message: "This will seed your database with sample data. Are you sure?",
  options: [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ],
})

if (!confirmation || isCancel(confirmation)) {
  cancel("Seeding cancelled")
  process.exit(0)
}

const userCountInput = await text({
  message: "How many users do you want to create?",
  initialValue: "3",
  validate: (value) => {
    const result = z.coerce.number().min(1).safeParse(value)

    if (result.success) return

    return "Please enter a number"
  },
})

s.start("Seeding database...")

await db.transaction(async (tx) => {
  const userCount = Number.parseInt(userCountInput.toString(), 10)

  log.info("Starting transaction...")
  // Create users with profiles
  const users = await tx
    .insert(user)
    .values(
      Array.from({ length: userCount }).map(() => ({
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(["admin", "user"]),
      })),
    )
    .returning()

  if (users.length !== userCount) {
    throw new Error("Failed to create users")
  }

  log.success("Created users")

  await tx.insert(profile).values(
    users.map((user): typeof profile.$inferInsert => ({
      userId: user.id,
      name: faker.person.fullName(),
      preferredLocale: faker.helpers.arrayElement(["en", "es"]),
      avatarUrl: faker.image.avatar(),
    })),
  )

  log.success("Created profiles")

  // Create passwords
  const hashedPassword = await hash("password123")
  await tx
    .insert(password)
    .values(
      users.map((user): typeof password.$inferInsert => ({
        userId: user.id,
        hash: hashedPassword,
      })),
    )

  log.success("Created passwords")

  // Create organizations
  const [org1, org2, org3] = await tx
    .insert(organization)
    .values([
      { name: faker.company.name() },
      { name: faker.company.name() },
      { name: faker.company.name() },
    ])
    .returning()

  if (!org1 || !org2 || !org3) {
    throw new Error("Failed to create organizations")
  }

  s.message("Created organizations")

  // Create accounts (organization memberships)
  await tx.insert(account).values(
    users.map((user): typeof account.$inferInsert => ({
      userId: user.id,
      organizationId: faker.helpers.arrayElement([org1.id, org2.id, org3.id]),
      role: faker.helpers.arrayElement(["owner", "member", "admin"]),
    })),
  )

  s.message("Created accounts")
})

s.stop("Transaction complete")

outro("Database seeded successfully")
