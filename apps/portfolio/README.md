# portfolio

The main portfolio site, served at **https://adrianc.dev**.

The repo-wide requirements and decisions in the root [CLAUDE.md](../../CLAUDE.md) apply here. This file covers only what's specific to this app.

## Stack

- **Next.js** (App Router) using **static export** (D10): `next build` writes the whole site to `out/`.
- **Tailwind CSS v4**: theme tokens live in `src/app/globals.css`.
- **Cloudflare Workers static assets** (D4): `wrangler.jsonc` uploads `out/` and serves it at `adrianc.dev`. There is no Worker code.

## Commands

Run from the repo root:

```bash
pnpm --filter portfolio dev        # dev server at http://localhost:3000
pnpm --filter portfolio build      # static export to out/
pnpm --filter portfolio preview    # build, then serve out/ with wrangler dev (http://localhost:8787)
pnpm --filter portfolio lint
pnpm --filter portfolio typecheck
pnpm --filter portfolio deploy     # build, then wrangler deploy (see the Deployment section in CLAUDE.md)
```

## App-specific notes

| Type            | Note                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirement     | No server features (R6). `next build` fails if a page uses one.                                                                                                      |
| Design decision | Code lives under `src/`, which keeps app code apart from config files. Proposed by Claude; the alternative is putting `app/` at the root of this folder.             |
| Design decision | `next.config.ts` sets `images.unoptimized: true`. Images are served as committed, so resize and compress them before adding.                                         |
| Design decision | Unknown paths serve Next's `404.html` (`not_found_handling: "404-page"` in `wrangler.jsonc`).                                                                        |
| Design decision | Fonts: Geist (from the scaffold), loaded with `next/font` at build time, so visitors download it from this site, not Google. Easy to change in `src/app/layout.tsx`. |
