import { $ } from "bun"

await $`git fetch template`

await $`git merge template/main --allow-unrelated-histories`
