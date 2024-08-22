<p align="center">
  <h1 align="center">🪽 Startline</h1>

  <p align="center">
    <em><strong>An opinionated SaaS starter template to hit the ground running</strong></em>
  </p>
</p>

_This project is built with [Startline](https://github.com/adelrodriguez/startline)._

Startline is an opinionated, batteries-included starter template to build SaaS applications using (my current favorite) technologies. The stack is built around [Next.js](https://nextjs.org) and serverless technologies.

### The stack includes:

- Internationalization
- Error tracking
- Authentication
- Background jobs
- Rate limiting
- Email delivery
- Caching
- Payments
- File uploads
- Analytics
- Environment variable validation

## Technologies

- [Next.js](https://nextjs.org) as our React framework
- [Drizzle ORM](https://drizzle.dev) as our ORM
- [LibSQL](https://libsql.org) as the database (deployed to [Turso](https://turso.tech))
- [Lucia](https://lucia-auth.com) for authentication
- [Conform](https://conform.guide) for form handling
- [Tailwind CSS](https://tailwindcss.com) for styling
- [ShadcnUI](https://ui.shadcn.com) as the component library
- [Resend](https://resend.com) for email delivery, with [React Email](https://react.email) for templating
- [Stripe](https://stripe.com) for payment processing
- [Upstash Redis](https://upstash.com) for serverless caching and rate limiting, and [Upstash Qstash](https://upstash.com/qstash) for serverless job queue
- [Sentry](https://sentry.io) for error tracking
- [PostHog](https://posthog.com) for analytics
  - [Plausible](https://plausible.io) is also supported
- [Uploadthing](https://uploadthing.com) for file uploads
- [next-intl](https://next-intl-docs.vercel.app/) for internationalization

### ...plus some other stuff to make development a breeze:

- [Bun](https://bun.sh) for the package manager and shell for executing scripts
- [Drizzle Kit](https://drizzle.dev/kit) for migrations and studio
- [Biome](https://biomejs.dev) for formatting and linting
- [Taze](https://github.com/antfu/taze) for dependency management
- [Vitest](https://vitest.dev) for testing
- A Docker Compose file for local development (database and Redis)
- GitHub Action to keep the template in sync with the latest version of Startline

## Getting started

TODO
