# CI

`.github/workflows/ci.yml` runs on every PR and push to `main`. Changes are
classified (`docs-only` / `metadata` / `full` by `scripts/classify-changes.mjs`);
the required check is the **CI gate** job (`scripts/ci-gate.mjs`). Unknown or
code paths always get the full suite.
