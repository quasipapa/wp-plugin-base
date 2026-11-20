---
scope: base
---

# CI of the template itself

`.github/workflows/ci.yml` in this repository verifies **wp-plugin-base the
template**, not a finished plugin. The raw template ships `{{PLACEHOLDER}}`
tokens that are only expanded by `scripts/init-template.mjs`, so lint, tests
and the build cannot run on the raw tree.

Therefore every CI job that executes checks runs `npm run init:example` after
`npm ci`. That initializes the example plugin in place with the values from
`plugin.config.json` (`example-plugin`), so the gates verify exactly the tree
a derived project gets after `scripts/init-template.mjs`. CI runners are
ephemeral, so the in-place initialization never modifies the template checkout.

`npm run init:example` is a no-op once a project is initialized
(idempotency guard in `scripts/init-template.mjs`), which is why the same
workflow file is safe for derived projects: their `template-docs/` directory
no longer exists, so the guard skips initialization and the checks run
directly on their tree.

## Gotchas when changing the template

- Do not add lines above `__( ... )` calls in `src/edit.jsx` (or any file
  referenced from `languages/*.pot|po`): `i18n:check` regenerates the
  catalogs and diffs them, so line references must stay stable. Import new
  styles from `src/index.js` instead.
- `init-template.mjs` must never read/write binary files (`.mo`) as UTF-8 —
  that corrupts them and breaks `i18n:check`. Binary files are only renamed.
- `plugin.config.json` `requiredPackageEntries` must match what
  `npm run build` actually emits (e.g. `build/index.css` requires an
  `editor.scss` import).

Project-scope CI documentation for derived plugins lives in
`docs/operations/ci.md` (this directory is not copied into derived projects).
