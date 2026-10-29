# To Do +

A to-do list with priorities, deadlines and task types, served at **https://todo-plus.adrianc.dev**.

The repo-wide requirements and decisions in the root [CLAUDE.md](../../CLAUDE.md) apply here. This file covers what's specific to this app.

## Status

**Iteration 1 (in progress):** front end only, with tasks saved in the browser's localStorage. Scaffolded with a placeholder page; features not built yet.

**Iteration 2 (planned):** full stack with a real database and sign-in.

## Requirements

| #   | Requirement                                                                                                                         | Source                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| T1  | Each task has a priority level, a deadline and a task type.                                                                         | Adrian                       |
| T2  | The list can be filtered by these fields, including several filters at once.                                                        | Adrian                       |
| T3  | Clicking a task opens a detail view to see and add more context.                                                                    | Adrian                       |
| T4  | Iteration 1 is front-end only: data is stored in the browser, with no server or database.                                           | Adrian                       |
| T5  | A later iteration becomes full stack (server, database, sign-in).                                                                   | Adrian                       |
| T6  | Served at `todo-plus.adrianc.dev`. The app is titled "To Do +", but "+" isn't allowed in a domain name.                             | Adrian / Platform (DNS)      |
| T7  | No per-task pages (e.g. `/tasks/<id>`): tasks are created in the browser after the site is built, so they can't be pre-built pages. | Platform (R6, static export) |

## Design decisions

**Status:** _Decided_ = Adrian chose it. _Proposed_ = Claude's default, not yet confirmed. _Deferred_ = to be decided later.

| #    | Decision          | Choice                                                                                   | Why                                                                            | Main alternatives                                 | Status   |
| ---- | ----------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------- | -------- |
| TD1  | Stack             | Next.js + Tailwind with static export, same as the portfolio                             | Familiar setup; iteration 1 needs no server                                    | Vite + React                                      | Decided  |
| TD2  | Task fields       | Title, notes, priority, deadline (optional), type, status, created/updated dates         | Covers T1 and T3; `status` lets a Kanban view be added later                   | Fewer fields                                      | Decided  |
| TD3  | Detail view       | Side panel over the list; full screen on phones                                          | Keeps the filtered list in place behind it; works with T7                      | Pop-up dialog; separate page                      | Decided  |
| TD4  | Deadline filter   | Preset ranges such as "Due this week" and "Due this month"; exact options to be designed | Adrian wants relative ranges, not a specific date. Not part of the first build | Date picker; custom date range                    | Deferred |
| TD5  | Storage code      | All saving/loading goes through one storage module                                       | Iteration 2 swaps only that module for database calls                          | Calling localStorage directly throughout          | Decided  |
| TD6  | Storage (iter 1)  | localStorage: survives refreshes and browser restarts, on this browser only              | Losing tasks on refresh would make the app frustrating to use                  | In-memory state; sessionStorage                   | Decided  |
| TD7  | Layout            | List with filters; a Kanban view may be added later as a second view                     | Best fit for filtering on many fields (T2); works well on phones               | Kanban, table, calendar, Eisenhower matrix        | Decided  |
| TD8  | Task types        | Fixed list (e.g. Work, Personal, School, Errands); custom types later                    | Simpler first version                                                          | User-created types                                | Decided  |
| TD9  | Priority levels   | Low / Medium / High / Urgent                                                             | Adrian's choice                                                                | 3 levels                                          | Decided  |
| TD10 | Database (iter 2) | Leaning toward Supabase (Postgres with built-in sign-in)                                 | Built-in sign-in is the biggest draw; the app might even stay static           | Cloudflare D1 (+ an auth library), Neon, Firebase | Deferred |
| TD11 | Local ports       | `dev` on port 3001, `preview` on 8788                                                    | Lets this app run at the same time as the portfolio (3000 / 8787)              | Default ports, one app at a time                  | Proposed |

## Commands

Run from the repo root:

```bash
pnpm --filter todo-plus dev        # dev server at http://localhost:3001
pnpm --filter todo-plus build      # static export to out/
pnpm --filter todo-plus preview    # build, then serve out/ with wrangler dev (http://localhost:8788)
pnpm --filter todo-plus lint
pnpm --filter todo-plus typecheck
pnpm --filter todo-plus deploy     # build, then wrangler deploy (see the Deployment section in CLAUDE.md)
```

## Notes

- `AGENTS.md` was generated by create-next-app. It tells AI coding tools to read the docs bundled with this Next.js version, and `next dev` re-creates it if it's deleted.
