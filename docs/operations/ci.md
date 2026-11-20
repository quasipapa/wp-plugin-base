---
scope: project
---

# CI

`.github/workflows/ci.yml` runs on every PR and push to `main`. Changes are
classified (`docs-only` / `metadata` / `full` by `scripts/classify-changes.mjs`);
the required check is the **CI gate** job (`scripts/ci-gate.mjs`). Unknown or
code paths always get the full suite.

Because this repository is the raw template, every job that runs the checks
first initializes the example plugin in place (`npm run init:example`, a no-op
once initialized). That expands the `{{PLACEHOLDER}}` tokens, so lint, tests
and the build verify the same tree a derived project would get after
`scripts/init-template.mjs`. CI runners are ephemeral, so the in-place
initialization never touches the template itself.
