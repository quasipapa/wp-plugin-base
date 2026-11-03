# AGENTS.md — {{NAME}}

> Entry point for coding agents. Authoritative documentation overview:
> [docs/index.md](docs/index.md).

## Project

WordPress plugin **{{NAME}}** ({{SLUG}}), generated from
[wp-plugin-base](https://github.com/quasipapa/wp-plugin-base) (base version:
see `template-meta/base-lock.json`). English for code, comments, commits and
documentation. Target platform: WordPress ≥ 6.1, PHP ≥ 8.0.

## Binding guidelines (read first)

1. [Documentation policy](docs/documentation-policy.md) — applies to every
   change, including agent-made ones.
2. [SECURITY.md](SECURITY.md) — report vulnerabilities privately, never as
   public issues.
3. [PR template](.github/pull_request_template.md) — answer the
   documentation-impact questions.
4. How this project uses the base, absorbs base updates and uses the agent
   skill: [docs/using-the-base/](docs/using-the-base/build.md).

## Working rules for agents

- Never edit `node_modules/`, `vendor/`, `build/`, `dist/` or generated
  translation catalogs.
- Files listed in `template-meta/managed-files.txt` are base-owned: change
  them only via a base upgrade (see
  [upgrade guide](docs/using-the-base/upgrade.md)), never ad hoc.
- No changes without tests; keep existing tests green.
- WordPress conventions: WPCS (`phpcs.xml.dist`), sanitizing/escaping, nonces
  + capability checks on input.
- Documentation in the same change; `npm run check:docs` must pass.
- Keep versions consistent across `package.json`, the plugin header, the
  version constant, `src/block.json` and `readme.txt`.
- i18n: text domain `{{TEXT_DOMAIN}}`; commit PO together with generated POT,
  MO and JSON (`npm run i18n:generate`, `npm run i18n:check`).
- No force-push, no direct commits on `main` — PRs with a green CI gate.

## Commands

| Task | Command |
| --- | --- |
| Install dependencies | `npm install` && `npm run composer:install` |
| Start dev site | `npm run env:start` (http://localhost:8888, `admin` / `password`) |
| Format/lint checks | `npm run format:check`, `npm run lint:js`, `npm run lint:css`, `npm run lint:php` |
| Unit tests | `npm run test:php`, `npm run test:js` (+ `npm run test:js:browser`) |
| Source gate | `npm run check` |
| Full local gate | `npm run test:local` |
| Production build | `npm run build` |
| Browser tests | `npm run test:browser` |

CI: `.github/workflows/ci.yml` on every PR and push to `main`. Releases: a
`v*` tag triggers `release.yml`.

## Definition of done for agent tasks

1. `npm run check` green; for code/test/dependency changes additionally
   `npm run test:local` green.
2. Coding standards pass without new errors.
3. Documentation updated per the documentation policy; `npm run check:docs`
   green.
4. PR template documentation questions answered.
5. Commit message explains *why*, not just *what*.
