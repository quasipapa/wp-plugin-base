---
scope: base
---

# AGENTS.md — wp-plugin-base (the template itself)

This file describes **wp-plugin-base the repository**. The `AGENTS.md` that
derived plugins receive lives at
[`template-meta/project/AGENTS.md`](template-meta/project/AGENTS.md) and is
copied to the project root by `scripts/init-template.mjs`.

## Documentation scopes

- **base scope** (`scope: base`): `template-docs/`, this file, root
  `README.md`, `CHANGELOG.md` — about the template. Not copied into derived
  plugins.
- **project scope** (`scope: project`): `docs/`, `template-meta/project/` —
  the skeleton derived plugins inherit. `docs/using-the-base/` is managed and
  refreshed by base upgrades.

`npm run check:docs` enforces the scope markers.

## Working on the base

- English for code, comments, commits and docs; GPL-2.0-or-later.
- The template must stay a working example plugin: `npm run check` and
  `npm run test:local` green on `main`.
- Changes to managed files are released via a `v*` tag (release.yml).
- Derived projects upgrade via `scripts/base-upgrade.mjs`; never edit their
  managed files from here.
- Generic WordPress knowledge is not duplicated here — see
  [WordPress/agent-skills](https://github.com/WordPress/agent-skills).

## Commands

| Task | Command |
| --- | --- |
| Source gate | `npm run check` |
| Full local gate | `npm run test:local` |
| Audit a derived project | `node scripts/base-audit.mjs` (inside the derived repo) |
