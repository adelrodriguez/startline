import Link from "next/link"

export default function Page() {
  return (
    <main className="flex flex-col justify-center gap-4">
      <h1>This is your project's home page</h1>
      <div className="flex flex-col gap-2">
        <Link href="/sign-in">Sign in</Link>
        <Link href="/sign-up">Sign up</Link>
      </div>
    </main>
  )
}
