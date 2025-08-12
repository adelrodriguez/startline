import { preloadQuery } from "convex/nextjs"
import { api } from "~/convex/api"
import TaskDisplay from "~/features/demo/components/task-display"

export default async function DemoPage() {
  const query = await preloadQuery(api.tasks.list)
  return <TaskDisplay query={query} />
}
