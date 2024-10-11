import { type NextRequest, NextResponse } from "next/server"
import { LOCALES, SESSION_COOKIE_NAME } from "~/lib/consts"
import { nextIntlMiddleware } from "~/server/middlewares"

export const handleI18nRouting = nextIntlMiddleware

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === "GET") {
    const response = NextResponse.next()
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null

    if (token !== null) {
      // Only extend cookie expiration on GET requests since we can be sure a
      // new session wasn't set when handling the request.
      response.cookies.set(SESSION_COOKIE_NAME, token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
    }
  }

  // CSRF protection
  if (request.method !== "GET") {
    const originHeader = request.headers.get("Origin")

    const hostHeader = request.headers.get("Host")

    if (originHeader === null || hostHeader === null) {
      return new NextResponse(null, {
        status: 403,
      })
    }

    let origin: URL

    try {
      origin = new URL(originHeader)
    } catch {
      return new NextResponse(null, {
        status: 403,
      })
    }

    if (origin.host !== hostHeader) {
      return new NextResponse(null, {
        status: 403,
      })
    }
  }

  // Handle i18n routing
  const { pathname } = request.nextUrl

  if (new RegExp(`^/(${LOCALES.join("|")})(/.*)?$`).test(pathname)) {
    return handleI18nRouting(request)
  }

  return NextResponse.next()
}
