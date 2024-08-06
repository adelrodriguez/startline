export default function Page() {
  const now = Date.now()

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-2">
      <h1 className="font-bold text-6xl">Healthy</h1>
      <div className="font-light text-4xl">{now}</div>
    </main>
  )
}

export const dynamic = "force-dynamic"
