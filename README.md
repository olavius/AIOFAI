# ◈ CFO Intelligence Platform · Ascando Partners

A production-grade AI-powered financial intelligence platform for CFOs and finance executives, built with Next.js 14 App Router.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Anthropic Claude (claude-opus-4-6) |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| File Parsing | SheetJS (xlsx) |

## Modules

| Module | Route | Description |
|--------|-------|-------------|
| Excel Intake | `/excel-intake` | Upload Excel/CSV → SheetJS parsing → Claude analysis |
| Strategy | `/strategy` | Industry + role + challenges → CFO AI strategy blueprint |
| Automate | `/automate` | Report description → automation blueprint (3 modes) |
| Power BI | `/powerbi` | Source system + domain → DAX measures + star schema |
| Sandbox | `/sandbox` | Streaming chat with session context |
| Metric Wizard | `/wizard` | 4-step guided KPI specification |

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Set up Supabase
Run `supabase/migrations/001_initial.sql` in your Supabase SQL Editor.

### 4. Set up Clerk
- Create a Clerk application at https://clerk.com
- Copy publishable key and secret key to `.env.local`
- Configure redirect URLs: sign-in `/sign-in`, sign-up `/sign-up`

### 5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/excel-intake` after sign-in.

## Environment Variables

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/excel-intake
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/excel-intake

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Sign-in / sign-up pages
│   ├── (modules)/       # Protected module pages
│   │   ├── layout.tsx   # Sidebar + mobile nav wrapper
│   │   ├── excel-intake/
│   │   ├── strategy/
│   │   ├── automate/
│   │   ├── powerbi/
│   │   ├── sandbox/
│   │   └── wizard/
│   ├── api/
│   │   ├── claude/      # POST: secure Anthropic calls
│   │   ├── claude/stream/ # POST: SSE streaming
│   │   ├── upload/      # POST: Excel/CSV parsing
│   │   └── analyses/    # GET: fetch saved analyses
│   └── globals.css
├── components/
│   ├── layout/          # Sidebar, MobileNav, PageHeader
│   └── ui/              # ResultDisplay, LoadingState
├── lib/
│   ├── prompts.ts       # All Claude prompt builders
│   ├── supabase.ts      # DB client + helpers
│   └── utils.ts
└── types/               # TypeScript interfaces
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `ink` | `#0D1117` | Page background |
| `surface` | `#161B22` | Card background |
| `panel` | `#1C2331` | Input / border |
| `forest` | `#152F2C` | Active state fill |
| `forestMid` | `#204E4C` | Hover border |
| `forestBright` | `#2D7A72` | Primary accent, CTA |
| `gold` | `#CDC09D` | Labels, logo mark |
| `cream` | `#FBFAF6` | Primary text |

## Security

- All Anthropic API calls are server-side only (`/api/claude`)
- Clerk middleware protects all module routes
- Supabase uses service role key only on the server
- File uploads are validated for type and size (10MB max)
- No API keys are exposed to the client

## Deployment

```bash
npm run build
npm start
```

Compatible with Vercel, Railway, and any Node.js host.
Set all environment variables in your hosting platform.
