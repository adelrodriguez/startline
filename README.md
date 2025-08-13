# Next.js + Convex Starter Template

A modern, production-ready starter template for building full-stack applications with Next.js and Convex.

## Features

- ⚡ **Next.js 15** with App Router and TypeScript
- 🔐 **Authentication** with Better Auth (email/password, OAuth)
- 🗄️ **Real-time Database** powered by Convex
- 🎨 **Modern UI** with Tailwind CSS and Radix UI components
- 🌍 **Internationalization** with next-intl
- 📧 **Email** integration with Resend
- 🔍 **Type Safety** throughout the stack
- 🧪 **Testing** setup with Bun
- 📦 **Package Management** with Bun
- 🔧 **Developer Experience** with ESLint, Prettier, and TypeScript

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (real-time database & API)
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS, Radix UI
- **Email**: Resend
- **Runtime**: Bun
- **Deployment**: Vercel (frontend) + Convex (backend)

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Convex](https://convex.dev/) account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd your-project-name
bun install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Or run the setup script
bun run setup
```

### 3. Configure Environment Variables

Edit `.env` and add your configuration:

```bash
# Required - Get these from your Convex dashboard
NEXT_PUBLIC_CONVEX_URL="your-convex-deployment-url"
NEXT_PUBLIC_CONVEX_SITE_URL="your-convex-site-url"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Email (Resend)
EMAIL_FROM="noreply@yourdomain.com"
RESEND_API_KEY="your-resend-api-key"
MOCK_RESEND="true" # Set to false in production

# OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Set Up Convex

1. Create a [Convex account](https://convex.dev/)
2. Create a new project
3. Initialize Convex in your project:

```bash
bunx convex dev
```

4. Copy the generated URLs to your `.env` file

### 5. Start Development

```bash
# Start the development server
bun dev

# In another terminal, start Convex
bun run dev:convex
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
├── convex/                 # Convex backend functions and schema
│   ├── auth.config.ts     # Authentication configuration
│   ├── schema.ts          # Database schema
│   └── ...
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── features/          # Feature-based code organization
│   ├── shared/            # Shared utilities and components
│   │   ├── components/    # Reusable UI components
│   │   ├── auth/          # Authentication utilities
│   │   └── utils/         # Helper functions
│   └── ...
├── scripts/               # Development and build scripts
├── translations/          # Internationalization files
└── ...
```

## Authentication

This template includes a complete authentication system with:

- Email/password authentication
- OAuth providers (GitHub, Google)
- Sign-in codes (passwordless)
- Protected routes
- Session management

### Configuring Authentication

Authentication is configured in `convex/auth.config.ts`. To enable/disable auth methods, update your `.env`:

```bash
AUTH_PASSWORD="true"       # Email/password auth
AUTH_SIGN_IN_CODES="true" # Passwordless sign-in codes
AUTH_OAUTH="true"         # OAuth providers
```

## Database

Convex provides a real-time database with:

- Automatic schema validation
- Real-time subscriptions
- Built-in full-text search
- File storage
- Background jobs

Define your schema in `convex/schema.ts` and create functions in the `convex/` directory.

## Styling

The template uses:

- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible, unstyled components
- **shadcn/ui** component library
- **Dark mode** support

## Scripts

```bash
# Development
bun dev                    # Start Next.js dev server
bun run dev:convex        # Start Convex dev server
bun run setup             # Run initial setup

# Building
bun run build             # Build for production
bun run start             # Start production server

# Code Quality
bun run lint              # Run ESLint
bun run format            # Format with Prettier
bun run typecheck         # Type check with TypeScript

# Testing
bun test                  # Run tests
bun run test:watch        # Run tests in watch mode
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set your environment variables in Vercel dashboard
4. Deploy!

### Convex Deployment

```bash
# Deploy your Convex functions
bunx convex deploy

# Set production environment variables
bunx convex env set RESEND_API_KEY your_production_key
# ... other variables
```

## Customization

### Adding New Features

1. Create feature directories in `src/features/`
2. Add database tables in `convex/schema.ts`
3. Create Convex functions for backend logic
4. Build UI components in the feature directory

### Modifying Authentication

- Update `convex/auth.config.ts` for auth providers
- Modify `src/shared/auth/` for client-side auth utilities
- Update environment variables for new providers

### Styling

- Customize colors in `tailwind.config.js`
- Modify component styles in `src/shared/components/ui/`
- Add custom CSS in `src/shared/assets/styles/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://better-auth.com/docs)