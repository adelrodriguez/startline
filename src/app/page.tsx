import { SignedIn, SignedOut } from "@/components/auth"
import {
  Button,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TypographyH1,
  TypographyLead,
} from "@/components/ui"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <Icon name="rabbit" className="h-6 w-6" />
          <span className="sr-only">Startline</span>
        </Link>
        <nav className="ml-auto flex gap-1 sm:gap-2">
          <SignedIn>
            <Button variant="link" asChild>
              <Link href="/my">Go to dashboard</Link>
            </Button>
          </SignedIn>
          <SignedOut>
            <Button variant="link" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </SignedOut>
          <Button variant="link" asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
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
                    <Icon name="github" className="mr-2 size-4" />
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
