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
- [UploadThing](https://uploadthing.com) for file uploads
- [next-intl](https://next-intl-docs.vercel.app/) for internationalization
- [nuqs](https://github.com/47ng/nuqs) to manage state in search params

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

## How much does this cost to run?

All the services used in this stack have generous free tiers:

- Vercel: 100 GB of bandwidth and 100,000 function invocations per month
- Turso: 500 databases, 9GB total storage, 1 billion row reads per month
- Resend: 100 emails/day
- Upstash Redis: 10,000 commands/day
- Upstash QStash: 500 messages/day
- Sentry: 5,000 errors/month
- PostHog: 1 million events/month
- UploadThing: 2GB of storage

This can get you very far, but what you really want to know is how much it actually costs to run this stack for a real-world application.

We're going to assume you'll be paying the basic "Professional" tier for each service (not counting usage-based pricing):

- Vercel: $20/month
- Turso: $24.92/month
- Resend: $20/month
- Sentry: $26/month
- UploadThing: $10/month

Total: $100.92/month

Not taking into account usage-based pricing, this is $1,211.04/year. This can get you _very_ far, since you can share the services between all your projects.

But it is expensive. You can run a VPS for much cheaper. Maybe you like to self-host your own services and hate all the SaaS-glue. Maybe you just don't like serverless. That's fine. This stack isn't for you. I wouldn't recommend this stack unless you are actually aiming to build a SaaS where usage correlates with paying customers. If you build something for free and traffic spikes, if you don't have spend limits set... then yeah, you'll get rekt'd.

I am planning on building a cheaper, more traditional, VPS-based stack in the future which can be used to host fun experiments and side projects without worrying about serverless tax. I'll add it here when it's ready.
