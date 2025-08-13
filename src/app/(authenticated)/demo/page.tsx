import { preloadQuery } from "convex/nextjs"
import TaskDisplay from "~/features/demo/components/task-display"
import { api } from "~~/convex/_generated/api"

export default async function DemoPage() {
  const query = await preloadQuery(api.tasks.list)
  return <TaskDisplay query={query} />
}
