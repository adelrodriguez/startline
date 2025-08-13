"use client"

import { Code, Database, LogOut, Palette, Shield, Zap } from "lucide-react"
import { useSession, signOut } from "~/shared/auth/client"
import { Button } from "~/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card"
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyMuted,
} from "~/shared/components/ui/typography"

export default function Page() {
  const { data: session } = useSession()

  const features = [
    {
      icon: Shield,
      title: "Authentication",
      description: "Ready-to-use auth with Better Auth",
    },
    {
      icon: Database,
      title: "Real-time Database",
      description: "Convex backend with real-time updates",
    },
    {
      icon: Palette,
      title: "Modern UI",
      description: "Tailwind CSS with Radix UI components",
    },
    {
      icon: Zap,
      title: "Type Safety",
      description: "Full TypeScript support throughout",
    },
  ]

  const nextSteps = [
    "Customize your database schema in convex/schema.ts",
    "Add your business logic in the src/features/ directory",
    "Style your application in src/shared/components/",
    "Configure environment variables for production",
    "Deploy to Vercel and Convex",
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Welcome Header */}
      <div className="text-center">
        <TypographyH1 className="mb-4">
          Welcome to your Next.js + Convex app!
        </TypographyH1>
        <TypographyMuted className="text-lg">
          {session?.user?.email ? (
            <>
              Hello, {session.user.email}! Your application is ready to build
              upon.
            </>
          ) : (
            "Your modern full-stack application template is ready to go."
          )}
        </TypographyMuted>
      </div>

      {/* Features Grid */}
      <div>
        <TypographyH2 className="mb-8">What's Included</TypographyH2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card className="relative" key={feature.title}>
              <CardContent className="p-4">
                <CardTitle className="mb-2 flex items-center justify-start gap-3 text-lg">
                  <div className="w-fit rounded-lg bg-primary/10 p-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <TypographyH2 className="mb-8">Next Steps</TypographyH2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Ready to start building?
            </CardTitle>
            <CardDescription>
              Here are some suggestions to get you started with your project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <div className="flex items-start gap-3" key={step}>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-muted-foreground text-sm leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <TypographyH2 className="mb-8">Quick Actions</TypographyH2>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <a
              href="https://docs.convex.dev"
              rel="noopener noreferrer"
              target="_blank"
            >
              View Convex Docs
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://nextjs.org/docs"
              rel="noopener noreferrer"
              target="_blank"
            >
              Next.js Docs
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://tailwindcss.com/docs"
              rel="noopener noreferrer"
              target="_blank"
            >
              Tailwind Docs
            </a>
          </Button>
          {session?.user && (
            <Button 
              onClick={() => signOut()}
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Session Debug (only in development) */}
      {process.env.NODE_ENV === "development" && session && (
        <div>
          <TypographyH3 className="mb-4">Session Debug</TypographyH3>
          <Card>
            <CardContent className="p-4">
              <pre className="overflow-auto text-sm">
                {JSON.stringify(session, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
