import { $ } from "bun"

await $`git remote add template git@github.com:adelrodriguez/startline.git`

await $`git fetch --all`

await $`git merge template/main --allow-unrelated-histories`
