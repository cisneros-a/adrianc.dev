# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project goal

This repo is the single source for **adrianc.dev**, hosted on Cloudflare and maintained on GitHub.

- **`adrianc.dev`** (apex) — the main portfolio site.
- **`<project>.adrianc.dev`** — each side project lives on its own subdomain.

The portfolio links out to the side projects. Each side project can be deployed on its own without touching the others.

## How to communicate (read first)

Adrian may not know every tool used here. When working in this repo:

1. **Explain tools.** The first time a tool, service, library or command comes up in a conversation, say in one or two sentences what it is and what it does _here_. Be accurate and concise, and don't assume it's already known.
2. **Separate requirements from design decisions.** Whenever you propose or describe how something works, say which it is:
   - **Requirement:** something Adrian asked for, or something forced by the platform (e.g. "static export can't run API routes").
   - **Design decision:** a choice among options. Say who made it (Adrian, or a default Claude proposed), give the reason, and name the main alternatives.
3. Keep the **Requirements** and **Design decisions** sections below up to date. When a proposed default is confirmed or changed, update its status.

## Requirements

What has to be true. Change these only when Adrian says so.

| #   | Requirement                                                                                                                                                                                                                                                                | Source                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| R1  | The portfolio is served at `adrianc.dev`.                                                                                                                                                                                                                                  | Adrian                      |
| R2  | Side projects are served at `<project>.adrianc.dev`.                                                                                                                                                                                                                       | Adrian                      |
| R3  | Hosted on Cloudflare (DNS for `adrianc.dev` is already there).                                                                                                                                                                                                             | Adrian                      |
| R4  | Source code is kept and maintained on GitHub.                                                                                                                                                                                                                              | Adrian                      |
| R5  | Each side project can be deployed independently.                                                                                                                                                                                                                           | Follows from R2             |
| R6  | The portfolio can't use Next.js server features: API routes, middleware, Server Actions, rendering on request, or the built-in image optimizer. Every page must be buildable ahead of time.                                                                                | Platform (follows from D10) |
| R7  | Full-stack apps run on Workers, which means no long-running server process, CPU-time limits per request (about 10 ms free, 30 s by default on paid), a Worker size limit (about 3 MB compressed free, 10 MB paid), and only partial Node.js API support (`nodejs_compat`). | Platform (applies to D11)   |

## Design decisions

**Status:** _Decided_ = Adrian chose it. _Proposed_ = a default Claude suggested that Adrian hasn't confirmed yet; flag it before building heavily on it.

| #   | Decision                    | Choice                                                                                                                                                                                                                 | Why                                                                                                           | Main alternatives                                    | Status  |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- |
| D1  | Framework                   | Next.js (App Router)                                                                                                                                                                                                   | Adrian's choice                                                                                               | Astro, SvelteKit, plain HTML                         | Decided |
| D2  | Styling                     | Tailwind CSS v4                                                                                                                                                                                                        | Fast to iterate; theme is easy to share across apps                                                           | Plain CSS, CSS Modules                               | Decided |
| D3  | How deploys happen          | Wrangler, run from Adrian's laptop                                                                                                                                                                                     | Simplest setup; no CI to maintain                                                                             | GitHub Actions + Wrangler, Cloudflare Workers Builds | Decided |
| D4  | Hosting product (portfolio) | Cloudflare Workers static assets: Cloudflare serves the files in `out/` directly, with no Worker code                                                                                                                  | No adapter; free static requests; no Worker size limit                                                        | OpenNext on Workers, Cloudflare Pages                | Decided |
| D5  | Repo structure              | Monorepo: one folder per site under `apps/`                                                                                                                                                                            | One repo for everything (R4) while apps stay independent (R5)                                                 | One GitHub repo per project                          | Decided |
| D6  | Package manager             | pnpm with workspaces                                                                                                                                                                                                   | Handles monorepos well; fast; saves disk space                                                                | npm workspaces, Yarn, Bun                            | Decided |
| D7  | Language                    | TypeScript, strict mode                                                                                                                                                                                                | Catches errors before runtime                                                                                 | JavaScript                                           | Decided |
| D8  | Lint/format                 | ESLint (Next.js config) + Prettier with Tailwind plugin                                                                                                                                                                | Standard for Next.js projects                                                                                 | Biome                                                | Decided |
| D9  | Git workflow                | Short-lived branches, PRs into `main`, Conventional Commits                                                                                                                                                            | Keeps `main` clean and the history readable                                                                   | Commit straight to `main`                            | Decided |
| D10 | Portfolio rendering         | Next.js static export (`output: "export"` in `next.config.ts`) builds every page as HTML/CSS/JS in `out/`                                                                                                              | Avoids OpenNext friction; the portfolio doesn't need server features. Can switch to OpenNext later if it does | Full Next.js via OpenNext; Astro                     | Decided |
| D11 | Stack per side project      | Each app picks its own stack and records it, with its requirements and decisions, in its own README. Default to Next.js + Tailwind for familiarity; full-stack apps use OpenNext or another Workers-friendly framework | Apps are independent (R5), so each can use what fits it                                                       | One stack for everything                             | Decided |

## Tools glossary

Short descriptions of each tool and its role here. Add entries as new tools come in.

- **Cloudflare** — hosts the sites and runs DNS for `adrianc.dev`.
- **Cloudflare Workers** — Cloudflare's platform for running code on its servers worldwide. Each app here deploys as its own Worker.
- **Wrangler** — Cloudflare's command-line tool. It runs the Workers runtime locally (`wrangler dev`), uploads apps (`wrangler deploy`), manages secrets, and reads each app's `wrangler.jsonc` config (name, custom domain, bindings).
- **Workers static assets** — a Workers feature that serves a folder of files (HTML, CSS, images) directly. The portfolio uses only this, with no server code.
- **Next.js** — a React framework for building websites: pages, routing, server rendering.
- **Static export** — a Next.js build mode (`output: "export"`) that writes the whole site as plain files to `out/`, ready to be hosted anywhere.
- **OpenNext (`@opennextjs/cloudflare`)** — an adapter that converts a full Next.js build (with server features) into a Worker. Not used by the portfolio; full-stack apps can use it.
- **Bindings** — how a Worker connects to Cloudflare services (D1, KV, R2, etc.). They're declared in `wrangler.jsonc` and used from code with no connection strings.
- **D1 / KV / R2 / Durable Objects** — Cloudflare storage services for full-stack apps:
  - **D1:** SQLite database.
  - **KV:** key-value store, with fast reads and slower writes.
  - **R2:** file storage, similar to Amazon S3.
  - **Durable Objects:** small stateful servers for real-time features.
- **Tailwind CSS** — styling with small utility classes written directly in the markup (e.g. `px-4 text-lg`).
- **TypeScript** — JavaScript with type checking.
- **pnpm** — installs JavaScript packages. Its "workspaces" feature lets one repo hold several apps. `pnpm-workspace.yaml` lists the workspaces and, under `allowBuilds`, which packages may run install scripts (pnpm blocks them by default as a safety measure).
- **Corepack** — a tool that ships with Node.js and runs the exact pnpm version pinned in the root `package.json` (`packageManager` field), so everyone uses the same version.
- **ESLint / Prettier** — ESLint flags likely bugs and bad patterns. Prettier formats code automatically.
- **Git / GitHub** — Git tracks changes to the code. GitHub hosts the repo online.

## Repository layout

```
.
├── apps/
│   ├── portfolio/        # adrianc.dev
│   └── <project-name>/   # <project-name>.adrianc.dev
├── packages/             # shared code (UI, styles, config), only when actually shared
├── package.json          # root scripts (lint, typecheck, format) and the pinned pnpm version
├── pnpm-workspace.yaml   # workspace list and allowed install scripts
├── pnpm-lock.yaml        # exact installed versions; commit it, never edit by hand
├── .prettierrc.json      # Prettier config (shared by all apps)
└── CLAUDE.md
```

- The folder name under `apps/` matches the subdomain (e.g. `apps/notes` → `notes.adrianc.dev`).
- Each app has its own `package.json`, `wrangler.jsonc` and `README.md`.
- Don't create something in `packages/` until at least two apps need it.
- An app must not import from another app's folder. Shared code goes in `packages/`.

## Deployment

Deploys are run manually with Wrangler from Adrian's laptop (D3). Nothing deploys automatically when code is pushed to GitHub.

- **Login:** `wrangler login` signs in to Cloudflare through the browser once per machine. No API token needs to be stored in the repo.
- **Deploy from `main` only**, with no uncommitted changes and `main` pulled and pushed, so that what's live always matches GitHub (R4).
- **Check before deploying:** run lint, typecheck and `preview` locally. Nothing does this automatically.
- **Custom domains** are set per app in `wrangler.jsonc` (e.g. `adrianc.dev` for the portfolio).
- **Portfolio:** `wrangler.jsonc` points `assets.directory` at `./out` and has no `main` entry, because there's no Worker code. A deploy builds with `next build`, then uploads `out/` with `wrangler deploy`.
- **Secrets** (full-stack apps only; the static portfolio has no server to use them): use `wrangler secret put` for production and `.dev.vars` for local dev. **Never commit secrets**, `.dev.vars` or `.env` files. Anything in the portfolio's code is public.
- **First deploy of a new domain:** `custom_domain: true` makes Cloudflare create the DNS record for that hostname. If a record already exists (e.g. an older site at `adrianc.dev`), check it in the Cloudflare dashboard first. The deploy fails or replaces what's there.
- Claude must not run a deploy without Adrian's explicit go-ahead.

### Adding a new side project

1. Create `apps/<name>/` with its own `package.json`, `wrangler.jsonc` and `README.md`. Choose its stack (D11).
2. Set the custom domain to `<name>.adrianc.dev` in `wrangler.jsonc`.
3. Add a card/link for it on the portfolio.
4. Add it to the **Projects** table below.
5. Record any project-specific requirements or decisions in its README, using the same split as this file.

## Projects

| App       | URL                 | Description         | Status                                      |
| --------- | ------------------- | ------------------- | ------------------------------------------- |
| portfolio | https://adrianc.dev | Main portfolio site | Scaffolded (placeholder page, not deployed) |

## Commands

**One-time setup per machine:** run `corepack enable pnpm` so the `pnpm` command exists. Until then, prefix commands with `corepack` (e.g. `corepack pnpm install`).

Run from the repo root:

```bash
pnpm install                         # install dependencies for all apps
pnpm --filter portfolio dev          # Next.js dev server, for fast iteration
pnpm --filter portfolio build        # static export to apps/portfolio/out/
pnpm --filter portfolio preview      # build, then serve out/ locally with `wrangler dev`, just as Cloudflare will
pnpm --filter portfolio deploy       # build, then `wrangler deploy` to Cloudflare
pnpm lint && pnpm typecheck          # all apps
pnpm format                          # format everything with Prettier (format:check to only check)
```

Run `build` before calling a change done. `next dev` allows things that static export rejects (see R6), and `build` fails on them.

## Git & GitHub workflow

- `main` is what's live, or about to be deployed.
- Work on short-lived branches (`feat/...`, `fix/...`, `chore/...`, `docs/...`) and merge to `main` through a PR.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), scoped by app: `feat(portfolio): add projects section`.
- Keep commits and PRs small and focused.
- Don't commit build output or dependencies (`.next/`, `out/`, `.open-next/`, `.wrangler/`, `node_modules/`).

## Coding conventions

- Read the surrounding code before editing and match its style.
- **Portfolio (static export):**
  - Keep most components as Server Components. With static export, they run once at build time.
  - Add `"use client"` only where interactivity is needed in the browser.
  - Dynamic routes (e.g. `projects/[slug]`) must list every page with `generateStaticParams`.
  - Don't use anything from R6. If a feature seems to need it, flag it rather than working around it.
  - Use `next/font` for fonts and `next/link` for internal links.
  - For images: set `images.unoptimized: true` (or a custom loader) and commit images already resized and compressed.
- **Full-stack apps:** follow the app's README. If the app uses OpenNext, use only features it supports, and check its docs before relying on anything Node-specific (R7).
- Keep Tailwind theme tokens (colors, fonts, spacing) in one place.
- Accessibility: semantic HTML, alt text on images, keyboard navigable, sufficient color contrast.
- SEO basics on every public page: `<title>`, meta description, Open Graph tags, favicon.
- Responsive by default; check mobile widths.

## Working with Claude

- Ask before deploying, changing DNS or Cloudflare settings, or pushing to `main`.
- Verify changes locally (`build`, and `preview` when deploy config changed) before calling them done.
- When adding an app, a tool or a decision, update this file in the same change.
