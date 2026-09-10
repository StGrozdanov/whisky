# whisky
What you saw is Matt Pocock’s **idea → ship spine** from [AI Hero](https://www.aihero.dev) / [mattpocock/skills](https://github.com/mattpocock/skills). It is not a product that “runs GitHub for you.” It is a set of agent skills (markdown playbooks) that force one human-led planning session, then turn that session into **small GitHub issues** other agents can pick up independently.

This repo has none of that yet. No `.cursor/skills/`, no `AGENTS.md`, no `CONTEXT.md`.

---

## What it actually is

Coding agents fail in four predictable ways. Each skill in the pack exists to block one of them:

| Failure | Skill that blocks it |
|---|---|
| The agent builds the wrong thing | `/grill-with-docs` — it interviews you until assumptions are gone |
| It rambles / invents names | Shared glossary in `CONTEXT.md` (built during grilling) |
| The change is too big for one context window | `/to-spec` then `/to-tickets` — one issue per vertical slice |
| It ships untested mud | `/implement` + `/tdd` + `/code-review` |

Your friend was almost certainly running this sequence in one chat, then handing the **tickets** to other chats/agents:

```
grill-with-docs  →  to-spec  →  to-tickets  →  implement (one ticket per agent)
```

That last step is why it looked like “the agent created a couple of issues for the other agents.”

---

## The loop, in plain terms

### 1. Grill (`/grill-with-docs`)

You say something vague: “add offline retry for failed scans.”

The agent does **not** start coding. It builds a **design tree** and interviews you in rounds:

- Several numbered questions at once
- Each with a recommended answer
- You answer the round, then it asks the next frontier

It looks up facts itself (code, files, APIs). You only make **decisions**.

While this happens it also:

- Sharpens project jargon into `CONTEXT.md` (a glossary, not a spec)
- Writes an ADR only when a real architectural decision was made

The session ends when nothing is left silently assumed. That is the “plan + Q&A” you saw.

There is a lighter sibling, `/grill-me`, for non-code decisions. For this app, use `/grill-with-docs`.

### 2. Spec (`/to-spec`)

Same conversation. No new interview. It synthesizes what you already agreed into a spec and **publishes it to GitHub Issues**:

- Problem / solution
- Long user-story list
- Implementation + testing decisions
- Out of scope

It labels that issue something like `ready-for-agent`. That spec is the parent.

### 3. Tickets (`/to-tickets`) — this is the “issues for other agents” part

It proposes a breakdown, **you approve it**, then it creates **one GitHub issue per ticket**.

Rules that matter:

- Each ticket is a **vertical slice** (schema + API + UI + tests for one demoable behaviour), not “do the backend then the frontend”
- Each ticket is sized for **one fresh agent context window**
- Each ticket lists **Blocked by** (GitHub blocking links when possible)
- Tickets that can start now get `ready-for-agent`

Example:

| Issue | What it delivers | Blocked by |
|---|---|---|
| #41 Parent spec | Full feature description | — |
| #42 Persist failed scan locally | Offline queue writes | none |
| #43 Replay queue when online | Network retry works | #42 |
| #44 Show retry status in UI | User can see pending retries | #42 |

Other agents (new Cursor chats, Cloud Agents, Copilot coding agents) grab **#42**, **#43**, **#44** — not the giant parent. That is the factory.

### 4. Implement (`/implement #42`)

A **new, empty chat** per ticket. Pass the full issue URL, not just `#42`.

That agent:

1. Reads the ticket + parent spec
2. Agrees test seams
3. Drives red-green TDD
4. Typechecks / runs tests
5. Runs `/code-review`
6. Commits

It does **not** close the issue. You (or triage) do that after you check the PR.

Then you start a **fresh** chat for the next unblocked ticket. Carrying the previous ticket’s context is considered a bug, not a feature.

---

## How the GitHub piece is wired

On first setup, `/setup-matt-pocock-skills` asks:

1. **Tracker**: GitHub (via `gh`), GitLab, Linear/Jira (you describe it), or local markdown under `.scratch/`
2. **Triage labels** (e.g. `ready-for-agent`)
3. **Where docs live** (`CONTEXT.md`, ADRs)

It writes that into `docs/agents/` so later skills know to run `gh issue create` instead of guessing.

That is why your friend’s GitHub filled with issues: setup said “GitHub,” then `/to-tickets` created real issues with labels other agents can filter on.

---

## How to put this in *your* Cursor workflow

You use Cursor, so skip the Claude Code plugin. Install editable copies with [skills.sh](https://skills.sh/mattpocock/skills).

### Step 0 — Prerequisites

- Node.js
- This repo as a git remote on GitHub
- `gh` authenticated (`gh auth status`) so the agent can create issues

### Step 1 — Install the skills into this project

From the repo root:

```bash
npx skills@latest add mattpocock/skills --agent cursor
```

When it asks which skills to take, include at least:

- `setup-matt-pocock-skills`
- `grill-with-docs`
- `to-spec`
- `to-tickets`
- `implement`
- `tdd`
- `code-review`
- `ask-matt` (router when you are lost)

That writes files into `.cursor/skills/`. Commit them so the team gets the same playbooks.

Optional later: `wayfinder` (work too big for one grilling session), `triage`, `diagnosing-bugs`, `improve-codebase-architecture`.

Start a **new** Cursor Agent chat after install so the skills load.

### Step 2 — Configure this repo once

In Agent chat:

```
/setup-matt-pocock-skills
```

For Biometryx I would pick:

- Tracker: **GitHub**
- Docs: `CONTEXT.md` at repo root, ADRs in something like `docs/adr/`
- Labels: keep `ready-for-agent` if you want other agents to grab work

This creates `docs/agents/` and an `AGENTS.md` pointer. Do not skip this. Without it, `/to-tickets` does not know where to publish.

### Step 3 — Run the main flow on a real feature

Same chat, in order:

1. `/grill-with-docs` plus a one-sentence idea  
   Answer every round honestly. Correct the recommended answers. This is the whole point.

2. When it says you have a shared understanding: `/to-spec`  
   Check the GitHub issue it opened.

3. `/to-tickets`  
   Approve or merge/split the breakdown. Then let it create the issues.

4. Open a **new** Agent chat per ready ticket:  
   `/implement https://github.com/OWNER/REPO/issues/42`

5. Review the PR yourself. Close the issue when it is actually done.

If you are unsure which skill to fire, `/ask-matt`.

### Step 4 — How to use “other agents”

After tickets exist, any of these work:

- New Cursor Agent chats, one per issue
- Cursor Cloud Agents, each given one issue URL
- GitHub Copilot coding agent assigned to `ready-for-agent` issues (if you use that)

The skill pack does **not** auto-spawn those workers. It only produces the issues. You (or a GitHub Action / Copilot setting) assign them.

### Day-to-day rhythm after that

- Every non-trivial change starts with grilling, not “just implement this”
- Tiny bug → maybe skip spec/tickets and `/implement` after a short grill
- Huge unknown → `/wayfinder` first (decision tickets), then grill each decision
- Every few days → `/improve-codebase-architecture` as upkeep, not as a rewrite

---

## What I would *not* copy blindly

- Do not install the Claude plugin **and** the npx files. You get every skill twice.
- Do not let `/to-tickets` dump 15 issues on the first try. Start with 2–4 slices.
- Do not keep one mega-chat that grills, specs, tickets, *and* implements. The tickets exist so context can reset.
- `CONTEXT.md` is a glossary. If it becomes a dumping ground, the agents get worse, not better.

---

I have not installed anything. Before I do, I need a few choices:

1. **Scope** — install into this repo (`.cursor/skills/`, shared with the team) or only on your machine (`~/.cursor/skills/`)?
2. **Tracker** — GitHub Issues (matches what your friend did), or local markdown files first so nothing hits GitHub until you like the flow?
3. **How much** — main flow only (`setup`, grill, spec, tickets, implement, tdd, review), or the full pack?
4. **When** — walk through the installer in this repo now, or you only wanted the map?

If you answer those four, I can install and run `/setup-matt-pocock-skills` with you.