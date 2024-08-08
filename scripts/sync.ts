// This is a manual script to sync the template with the current repo. It is
// recommended to use the GitHub action included instead, but this script is
// useful to update the repo in case the action fails.
import { $ } from "bun"

await $`git fetch template`

await $`git merge template/main --allow-unrelated-histories`
