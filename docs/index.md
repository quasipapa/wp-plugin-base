---
scope: project
---

# Documentation index — {{NAME}}

Generated from [wp-plugin-base](https://github.com/quasipapa/wp-plugin-base).
The [documentation policy](documentation-policy.md) is binding for every
change, including agent-made ones.

This `docs/` tree is **project-scope** documentation. Documentation about the
base itself (architecture, ADRs, changelog) is **base-scope** and lives in the
[wp-plugin-base repository](https://github.com/quasipapa/wp-plugin-base/tree/main/template-docs),
not in this project.

## Using the base

- [Build a plugin on the base](using-the-base/build.md) — project setup,
  replacing the example block, quality gate.
- [Absorb base updates](using-the-base/upgrade.md) — audit and controlled
  upgrades via `template-meta/base-lock.json`.
- [Use the agent skill](using-the-base/skills.md) — `create`, `audit`,
  `upgrade` with `quasipapa/wp-plugin-base-skill`.

## Development

- [Setup](development/setup.md) — tooling and local environments.
- [Versions](development/versions.md) — supported platform matrix.
- [Workflow](development/workflow.md) — branches, PRs, quality gates.

## Operations

- [CI](operations/ci.md) — change classes, jobs, gate.
- [Releases](operations/releases.md) — tags, ZIP, checksums.
- [Maintenance](operations/maintenance.md) — support and security handling.

## Architecture

- [Overview](architecture/overview.md) — layout and runtime.
- [Decisions](architecture/decisions/) — ADRs; the base's own decisions live
  in the [wp-plugin-base](https://github.com/quasipapa/wp-plugin-base) repo.

## Testing

- [Strategy](testing/strategy.md) — layers and runners.
- [Automated verification](testing/automated.md) — what runs where.

## Requirements

- [Product](requirements/product.md) — functional requirements (FR-NNN).
- [Quality](requirements/quality.md) — non-functional requirements (NFR-NNN).

For generic WordPress development knowledge see
[WordPress/agent-skills](https://github.com/WordPress/agent-skills).
