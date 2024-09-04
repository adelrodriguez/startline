#!/usr/bin/env bun

import { rm } from "node:fs/promises"
import { join } from "node:path"

async function cleanDirectory(dir: string) {
  try {
    await rm(dir, { recursive: true, force: true })
    console.log(`Successfully cleaned ${dir}`)
  } catch (error) {
    console.error(`Error cleaning ${dir}:`, error)
  }
}

const rootDir = process.cwd()

await cleanDirectory(join(rootDir, ".next"))
await cleanDirectory(join(rootDir, ".data"))
