import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({}),
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    completed: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
})
