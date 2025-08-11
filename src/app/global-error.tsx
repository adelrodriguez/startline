"use client"

import NextError from "next/error"

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={500} title="Internal Server Error" />
      </body>
    </html>
  )
}
