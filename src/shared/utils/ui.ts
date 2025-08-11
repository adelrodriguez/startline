import { type ClassValue, clsx } from "clsx"
import { Inter } from "next/font/google"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const fonts = {
  body: inter,
  heading: inter,
}
