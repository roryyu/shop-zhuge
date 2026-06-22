# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShopZhuge (店诸葛) — a local-life intelligent service platform for physical store management. Multi-tenant SaaS with AI-powered features (store opening decisions, content creation, business analytics).

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint (flat config)
npm run db:seed      # Seed admin user (admin@admin.com / admin123, role: ADMIN)

# Prisma
npx prisma generate          # Regenerate client (outputs to src/generated/prisma/)
npx prisma migrate dev       # Create/apply migrations
npx prisma studio            # Database GUI

# Type check (no script defined, run directly)
npx tsc --noEmit
```

## Architecture

**Stack**: Next.js 16 (App Router) · React 19 · TypeScript · Prisma 7.8 (driver adapter) · PostgreSQL · NextAuth v5 beta · Tailwind CSS 4 · OpenAI SDK (DeepSeek/Ark)

### Key patterns

- **Prisma uses `@prisma/adapter-pg` driver adapter** (not the traditional binary engine). The client singleton in `src/lib/prisma.ts` uses `PrismaPg` with the `shopzhuge` schema. Generated output goes to `src/generated/prisma/`.
- **NextAuth v5** with credentials provider, JWT strategy. Auth entry point: `src/auth.ts`, config: `src/auth.config.ts`. Type augmentations in `src/types/next-auth.d.ts` add `id` and `role` to session/JWT.
- **Multi-tenancy**: Users belong to Tenants via `tenantId` FK. Roles: `"USER"`, `"ADMIN"`, `"TENANTADMIN"`.
- **No middleware.ts** — auth guards are at the component level (admin layout) and API route level (`auth()` checks).
- **UI components** follow shadcn/ui patterns (forwardRef, cva variants, Radix primitives). All styling uses Airbnb design tokens via CSS custom properties defined in `globals.css`. The `cn()` utility (`clsx` + `tailwind-merge`) is the standard classname helper.
- **Path alias**: `@/*` maps to `./src/*`.

### Directory layout

```
src/
  app/                 # App Router pages + API routes
    api/auth/          # NextAuth + registration endpoints
    api/admin/         # Admin-only CRUD (tenants)
    admin/             # Admin dashboard pages
    login/, register/  # Auth pages
  components/
    layout/            # Navbar, Footer
    ui/                # Reusable UI primitives (badge, button, card, input, etc.)
  lib/
    prisma.ts          # Prisma singleton (globalThis pattern)
    utils.ts           # cn() classname utility
  auth.ts              # NextAuth exports (handlers, auth, signIn, signOut)
  auth.config.ts       # NextAuth config (providers, callbacks, adapter)
prisma/
  schema.prisma        # 8 models: Tenant, User, Session, Document, AIConversation, etc.
  seed.ts              # Seeds admin user
  migrations/          # SQL migrations
```

## Important Notes

- **Next.js 16 has breaking changes** from prior versions. Check `node_modules/next/dist/docs/` before writing code — the bundled docs are authoritative for this version.
- **AI integration** uses OpenAI SDK pointed at DeepSeek V4 pro / Volcano Engine Ark (configurable via env vars `DEEPSEEK_API_KEY` / `ARK_API_KEY`).
- **Env vars**: See `.env.example` for required variables (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, DEEPSEEK_API_KEY, ARK_API_KEY, SMS config).

## Behavioral guidelines 
to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
