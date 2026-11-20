---
scope: base
---

# Base documentation (wp-plugin-base itself)

Everything under `template-docs/` describes **wp-plugin-base the template** —
not the plugins generated from it. This directory is _not_ copied into
derived projects (`scripts/init-template.mjs` removes it); the authoritative,
always-current copy lives in this repository.

- [Decisions](decisions/) — ADRs about the base itself (architecture, release
  process, tooling choices).
- The using-the-base guides (`build`, `upgrade`, `skills`) are the exception:
  their authoritative copies live in [`docs/using-the-base/`](../docs/using-the-base)
  because derived projects inherit them as _managed_ files — they are part of
  the project-scope documentation and are refreshed by base upgrades.

## Scope convention

| Scope     | Location                                                              | Audience                      | Copied to derived plugins?      |
| --------- | --------------------------------------------------------------------- | ----------------------------- | ------------------------------- |
| `base`    | `template-docs/`, root `README.md`, root `AGENTS.md`, `CHANGELOG.md`  | maintainers of wp-plugin-base | no (init removes/replaces them) |
| `project` | `docs/`, `template-meta/project/`, configs, `src/`, `plugin-main.php` | authors of derived plugins    | yes                             |

Rule of thumb when adding docs: **does it describe wp-plugin-base itself or the
plugins generated from it?** The template's own processes (CI, release,
init/upgrade tooling) belong here — e.g. [CI of the template](ci.md), whose
counterpart for derived projects is `docs/operations/ci.md`. Anything a
derived project inherits belongs in `docs/`.

`npm run check:docs` enforces the `scope` frontmatter on these files. Never
link from project-scope files to `template-docs/` — derived projects do not
have it; reference it in inline code or via the GitHub URL instead.
