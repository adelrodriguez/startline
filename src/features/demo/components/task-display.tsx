"use client"

import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import { Button } from "~/shared/components/ui/button"
import { TypographyH4, TypographyP } from "~/shared/components/ui/typography"
import { api } from "~~/convex/_generated/api"

export default function TaskDisplay({
  query,
}: {
  query: Preloaded<typeof api.tasks.list>
}) {
  const tasks = usePreloadedQuery(query)
  const createTask = useMutation(api.tasks.create)

  return (
    <div>
      <ul className="flex flex-col gap-4">
        {tasks?.map((task) => (
          <div className="flex flex-col" key={task._id}>
            <TypographyH4>{task.title}</TypographyH4>
            <TypographyP>{task.description}</TypographyP>
          </div>
        ))}
      </ul>
      <Button
        onClick={() => createTask({ title: "Test", description: "Test" })}
      >
        Create Task
      </Button>
    </div>
  )
}
