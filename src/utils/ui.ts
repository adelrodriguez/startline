import { type ClassValue, clsx } from "clsx"
import { Inter } from "next/font/google"
import { twMerge } from "tailwind-merge"

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args))
}

const inter = Inter({ subsets: ["latin"] })

export const fonts = {
  body: inter,
  heading: inter,
}
