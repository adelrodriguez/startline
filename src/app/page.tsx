import { RabbitIcon } from "lucide-react"
import Link from "next/link"
import { Authenticated, Unauthenticated } from "~/shared/components/auth/state"
import { ModeToggle } from "~/shared/components/theme"
import { Button } from "~/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/shared/components/ui/tooltip"
import { TypographyH1, TypographyLead } from "~/shared/components/ui/typography"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6">
        <Link
          className="flex items-center justify-center"
          href="#"
          prefetch={false}
        >
          <RabbitIcon className="size-6" />
          <span className="sr-only">Startline Web</span>
        </Link>
        <nav className="ml-auto flex gap-1 sm:gap-2">
          <Authenticated>
            <Button asChild variant="link">
              <Link href="/my">Go to dashboard</Link>
            </Button>
          </Authenticated>

          <Unauthenticated>
            <Button asChild variant="link">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="link">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </Unauthenticated>

          <Button asChild variant="link">
            <Link href="/demo">Demo</Link>
          </Button>

          <ModeToggle />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full pt-12 md:pt-24 lg:pt-32">
          <div className="container space-y-10 xl:space-y-16">
            <div className="flex flex-col items-center gap-4 text-center">
              <TypographyH1>Startline</TypographyH1>

              <TypographyLead className="max-w-2xl">
                A feature-rich template to kickstart your next project. Packed
                with powerful tools and integrations to help you build faster.
              </TypographyLead>

              <div className="mt-6">
                <Button asChild>
                  <Link href="https://git.new/start" prefetch={false}>
                    <GitHubIcon />
                    Go to repo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 justify-center gap-2 border-t px-4 py-6 md:px-6">
        <p className="text-muted-foreground text-xs">
          <Tooltip>
            Made from the <TooltipTrigger>🌴</TooltipTrigger> by{" "}
            <TooltipContent>
              <p>Dominican Republic</p>
            </TooltipContent>
          </Tooltip>
          <Link href="https://adel.do">Adel Rodriguez</Link>
        </p>
      </footer>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg
      className="mr-2 size-4 fill-white dark:fill-black"
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}
