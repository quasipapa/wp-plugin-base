# Build a plugin on wp-plugin-base

<a id="build-001"></a>

This guide turns a freshly generated project into your own plugin.

## 1. Generate and initialize

```bash
gh repo create my-plugin --template quasipapa/wp-plugin-base --public
cd my-plugin
node scripts/init-template.mjs --name "My Plugin" --slug my-plugin \
  --author <you> --repo <you>/my-plugin
npm install
npm run format        # re-format after placeholder replacement (idempotent)
npm run env:start
npm run i18n:generate # regenerate POT/PO/MO/JSON for your text domain
```

`init-template.mjs` replaces the `{{PLACEHOLDER}}` tokens (name, slug, text
domain, namespace, prefix, author, repo, license), renames `plugin-main.php`
to `<slug>.php` and writes `template-meta/base-lock.json` with the hashes of
all base-managed files.

The values live in `plugin.config.json`; all scripts and workflows read them
from there — never hardcode the slug in your own code.

## 2. Replace the example block with your own

The template ships a minimal dynamic block (`{{SLUG}}/example` in
`src/block.json`, rendered by `src/render.php`). Replace `src/`, the bootstrap
`plugin-main.php` and `readme.txt` with your plugin code. Keep:

- `plugin.config.json` — single source for slug/text domain/packaging.
- `template-meta/` — base bookkeeping; do not edit by hand.
- the base-managed files listed in `template-meta/managed-files.txt` — change
  them only through a base upgrade (see [upgrade](upgrade.md)).

## 3. Requirements, docs, tests

- Write your requirements with stable IDs in `docs/requirements/` and record
  decisions as ADRs in `docs/architecture/decisions/`.
- Every change updates the docs in the same commit (`npm run check:docs`).
- Add tests at the cheapest reliable layer (see
  [test strategy](../testing/strategy.md)): PHPUnit for PHP, Vitest for JS
  (jsdom project by default, Browser Mode for component tests), Playwright for
  WordPress E2E.

## 4. Verify

```bash
npm run check        # source gate: docs, format, lints, unit tests, i18n, build
npm run test:local   # full gate: wp-env integration, Plugin Check, Playwright, Browser Mode
```

Open a PR; the CI gate must be green before merge.
