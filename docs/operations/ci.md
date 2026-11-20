---
scope: project
---

# CI

`.github/workflows/ci.yml` runs on every PR and push to `main`. Changes are
classified (`docs-only` / `metadata` / `full` by `scripts/classify-changes.mjs`);
the required check is the **CI gate** job (`scripts/ci-gate.mjs`). Unknown or
code paths always get the full suite.

The checks run directly on the project tree. (The wp-plugin-base template
itself initializes its example plugin before running them — that is base-scope
and documented in the base repository under `template-docs/`; it does not apply
here because derived projects are already initialized.)
