import { $ } from "bun"

await $`git fetch --all`

await $`git merge template/main --allow-unrelated-histories`
