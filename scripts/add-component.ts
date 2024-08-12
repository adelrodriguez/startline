import fs from "node:fs/promises"
import { parseArgs } from "node:util"
import { cancel, intro, isCancel, outro, spinner, text } from "@clack/prompts"
import { $ } from "bun"
import { z } from "zod"

const s = spinner()

console.log({ argv: Bun.argv })

const { positionals } = parseArgs({
  args: Bun.argv.slice(2),
  allowPositionals: true,
})

intro("Adding a new component")

const component = await text({
  message: "What is the name of the component?",
  placeholder: "'button', 'card', etc.",
  initialValue: positionals[0],
  validate: (value) => {
    const result = z.string().min(1).safeParse(value)

    if (result.success) return

    return "Please enter a component name"
  },
})
const componentName = component.toString()

if (isCancel(component)) {
  cancel("Installation is cancelled.")

  process.exit(0)
}

s.start(`Creating ${componentName.toString()} component...`)
await $`shadcn-ui add ${componentName}`
s.stop("Component created")

s.start("Adding component to index.ts...")
await fs.appendFile(
  "./src/components/ui/index.ts",
  `export * from "./${componentName}"\n`,
)
s.stop("Component added to index.ts")

outro("Finished adding component.")
