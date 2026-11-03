---
scope: project
---

# Releases

A `v*` tag triggers `.github/workflows/release.yml`: full local gate, version
agreement check, reproducible ZIP + SHA-256 (`scripts/build-zip.sh`,
`scripts/check-delivery.mjs`) and a GitHub release.
