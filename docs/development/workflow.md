---
scope: project
---

# Development workflow

- Feature branch per task: `feature/<short-description>`; PR against `main`;
  the required **CI gate** must be green.
- No direct commits on `main`, no force-push.
- Releases: `v*` tag triggers `.github/workflows/release.yml`.
- Base updates follow [../using-the-base/upgrade.md](../using-the-base/upgrade.md).
