"use client"

import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react"
import { Calendar, FileText, Plus } from "lucide-react"
import { Badge } from "~/shared/components/ui/badge"
import { Button } from "~/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card"
import { Separator } from "~/shared/components/ui/separator"
import { Skeleton } from "~/shared/components/ui/skeleton"
import {
  TypographyH2,
  TypographyH4,
  TypographyMuted,
  TypographyP,
} from "~/shared/components/ui/typography"
import { api } from "~~/convex/_generated/api"

export default function TaskDisplay({
  query,
}: {
  query: Preloaded<typeof api.tasks.list>
}) {
  const tasks = usePreloadedQuery(query)
  const createTask = useMutation(api.tasks.create)
  const deleteTask = useMutation(api.tasks.remove)

  const handleCreateTask = () => {
    const titles = [
      "Review project proposal",
      "Update documentation",
      "Fix authentication bug",
      "Design new feature",
      "Write unit tests",
    ] as const
    const descriptions = [
      "Go through the project proposal and provide feedback on technical feasibility",
      "Update the API documentation with new endpoints and examples",
      "Investigate and fix the login authentication issue reported by users",
      "Create wireframes and design mockups for the new dashboard feature",
      "Add comprehensive test coverage for the user management module",
    ] as const

    const titleIndex = Math.floor(Math.random() * titles.length)
    const descriptionIndex = Math.floor(Math.random() * descriptions.length)

    const randomTitle = titles[titleIndex]
    const randomDescription = descriptions[descriptionIndex]

    createTask({
      title: randomTitle ?? "",
      description: randomDescription ?? "",
    })
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask({ id: taskId })
  }

  const getPriorityVariant = (index: number) => {
    if (index % 3 === 0) {
      return "default"
    }
    if (index % 3 === 1) {
      return "secondary"
    }
    return "outline"
  }

  const getPriorityLabel = (index: number) => {
    if (index % 3 === 0) {
      return "High Priority"
    }
    if (index % 3 === 1) {
      return "Medium Priority"
    }
    return "Low Priority"
  }

  const getStatusLabel = (index: number) => {
    return index % 2 === 0 ? "In Progress" : "Completed"
  }

  const renderTasksContent = () => {
    if (!tasks) {
      // Loading skeleton
      return (
        <div className="space-y-4">
          {new Array(3).fill(0).map((_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardContent className="p-6">
                <Skeleton className="mb-3 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (tasks.length === 0) {
      // Empty state
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <TypographyH4 className="mb-2">No tasks yet</TypographyH4>
            <TypographyMuted className="mb-6">
              Create your first task to get started with project management
            </TypographyMuted>
            <Button onClick={handleCreateTask} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      )
    }

    // Tasks grid
    return (
      <div className="grid gap-4">
        {tasks.map((task, index) => (
          <Card className="transition-shadow hover:shadow-md" key={task._id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-1 text-lg">{task.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityVariant(index)}>
                      {getPriorityLabel(index)}
                    </Badge>
                    <Badge variant="outline">{getStatusLabel(index)}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm leading-relaxed">
                {task.description}
              </CardDescription>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <TypographyMuted className="text-xs">
                  Created {new Date(task._creationTime).toLocaleDateString()}
                </TypographyMuted>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                  <Button
                    className="text-destructive hover:text-destructive"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <TypographyH2 className="mb-2">Task Dashboard</TypographyH2>
          <TypographyMuted>Manage and track your project tasks</TypographyMuted>
        </div>
        <Button className="flex items-center gap-2" onClick={handleCreateTask}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <Separator />

      {/* Task Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <TypographyP className="mb-0 font-bold text-2xl">
                  {tasks?.length ?? 0}
                </TypographyP>
                <TypographyMuted className="text-sm">
                  Total Tasks
                </TypographyMuted>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <TypographyP className="mb-0 font-bold text-2xl">
                  {Math.floor((tasks?.length ?? 0) * 0.7)}
                </TypographyP>
                <TypographyMuted className="text-sm">Completed</TypographyMuted>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900">
                <Plus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <TypographyP className="mb-0 font-bold text-2xl">
                  {Math.ceil((tasks?.length ?? 0) * 0.3)}
                </TypographyP>
                <TypographyMuted className="text-sm">
                  In Progress
                </TypographyMuted>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <TypographyH4>Recent Tasks</TypographyH4>

        {renderTasksContent()}
      </div>
    </div>
  )
}
