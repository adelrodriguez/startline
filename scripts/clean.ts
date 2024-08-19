#!/usr/bin/env bun

import { spinner } from "@clack/prompts"
import { $ } from "bun"

async function cleanFolder(folderName: string) {
  const cleanupSpinner = spinner()
  cleanupSpinner.start(`Cleaning up ${folderName} folder`)

  try {
    await $`rm -rf ${folderName}`
    cleanupSpinner.stop(`${folderName} folder cleaned successfully`)
  } catch (error) {
    cleanupSpinner.stop(`Error cleaning ${folderName} folder`)
    console.error(`Error details for ${folderName}:`, error)
    throw error
  }
}

try {
  await cleanFolder(".next")
  await cleanFolder("node_modules")
  console.log("All cleanup tasks completed successfully")
} catch (error) {
  console.error("Cleanup process failed")
  process.exit(1)
}
