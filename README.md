---
scope: base
---

# wp-plugin-base

A reusable foundation for WordPress plugins: a GitHub **template repository**
with a pinned quality gate (CI with change classes, PHP + JavaScript unit
tests, Playwright browser tests, Plugin Check), reproducible release packaging
(ZIP + SHA-256 + GitHub Release), an i18n pipeline and a documentation policy
with stable IDs, ADRs and traceability.

Generated projects keep only their plugin-specific code (bootstrap, blocks,
classes, content); the shared machinery stays base-owned and is upgraded in a
controlled way.

## Use this template

```bash
gh repo create my-plugin --template quasipapa/wp-plugin-base --public
cd my-plugin
node scripts/init-template.mjs --name "My Plugin" --slug my-plugin \
  --author <you> --repo <you>/my-plugin
npm install
```

Then read [docs/using-the-base/build.md](docs/using-the-base/build.md) to build
your plugin, [docs/using-the-base/upgrade.md](docs/using-the-base/upgrade.md)
to absorb base updates and [docs/using-the-base/skills.md](docs/using-the-base/skills.md)
for the agent skill (`quasipapa/wp-plugin-base-skill`).

For generic WordPress development knowledge (blocks, plugins, wp-env, Plugin
Directory guidelines), use the upstream
[WordPress/agent-skills](https://github.com/WordPress/agent-skills) — this
template intentionally does not duplicate them.

## Layout

- `template-docs/` — **base-scope documentation** (this template's own
  architecture, ADRs, changelog). Not copied into derived plugins.
- `template-meta/project/` — project-scope skeletons for the root `README.md`
  and `AGENTS.md` of derived plugins.
- `docs/` — **project-scope documentation skeleton** inherited by derived
  plugins (policy first, including the `using-the-base/` guides).
- `template-meta/` — schemas, the managed-file list and the base lock of the
  generated project.
- `scripts/` — build, CI, documentation, i18n and delivery checks plus
  `init-template.mjs`.
- `.github/workflows/` — CI gate and release workflow.
- `src/`, `plugin-main.php`, `readme.txt` — a minimal example block that is
  replaced by your own plugin code.

Every Markdown file carries a `scope: base` or `scope: project` frontmatter
marker; `npm run check:docs` enforces it.

## License

GPL-2.0-or-later.
