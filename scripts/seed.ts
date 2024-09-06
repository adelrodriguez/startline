import db, { user, profile, organization, account, password } from "@/server/db"
import { cancel, isCancel, log, outro, select, spinner } from "@clack/prompts"
import { faker } from "@faker-js/faker"
import { hash } from "@node-rs/argon2"

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

s.start("Seeding database...")

await db.transaction(async (tx) => {
  log.info("Starting transaction...")
  // Create users with profiles
  const [user1, user2, user3] = await tx
    .insert(user)
    .values([
      { email: faker.internet.email(), role: "admin" },
      { email: faker.internet.email(), role: "user" },
      { email: faker.internet.email(), role: "user" },
    ])
    .returning()

  if (!user1 || !user2 || !user3) {
    throw new Error("Failed to create users")
  }

  log.success("Created users")

  await tx.insert(profile).values([
    {
      userId: user1.id,
      name: faker.person.fullName(),
      preferredLocale: faker.helpers.arrayElement(["en", "es"]),
    },
    {
      userId: user2.id,
      name: faker.person.fullName(),
      preferredLocale: faker.helpers.arrayElement(["en", "es"]),
    },
    {
      userId: user3.id,
      name: faker.person.fullName(),
      preferredLocale: faker.helpers.arrayElement(["en", "es"]),
    },
  ])

  log.success("Created profiles")

  // Create passwords
  const hashedPassword = await hash("password123")
  await tx.insert(password).values([
    { userId: user1.id, hash: hashedPassword },
    { userId: user2.id, hash: hashedPassword },
    { userId: user3.id, hash: hashedPassword },
  ])

  log.success("Created passwords")

  // Create organizations
  const [org1, org2] = await tx
    .insert(organization)
    .values([{ name: faker.company.name() }, { name: faker.company.name() }])
    .returning()

  if (!org1 || !org2) {
    throw new Error("Failed to create organizations")
  }

  s.message("Created organizations")

  // Create accounts (organization memberships)
  await tx.insert(account).values([
    { userId: user1.id, organizationId: org1.id, role: "owner" },
    { userId: user2.id, organizationId: org1.id, role: "member" },
    { userId: user3.id, organizationId: org1.id, role: "admin" },
    { userId: user2.id, organizationId: org2.id, role: "owner" },
    { userId: user3.id, organizationId: org2.id, role: "member" },
  ])

  s.message("Created accounts")
})

s.stop("Transaction complete")

outro("Database seeded successfully")
