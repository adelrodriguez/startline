import type { Config } from "tailwindcss"
import Typography from "@tailwindcss/typography"
import Forms from "@tailwindcss/forms"

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [Typography, Forms],
} satisfies Config
