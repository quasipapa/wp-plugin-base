# Absorb wp-plugin-base updates

<a id="upgrade-001"></a>

Base-owned files (see `template-meta/managed-files.txt`) are upgraded in a
controlled way; your plugin-specific files are never touched.

## How the bookkeeping works

`template-meta/base-lock.json` records:

- `baseRepo` / `baseVersion` — which template release the project was
  generated from or last upgraded to.
- `managedFiles` — SHA-256 of every base-managed file at that base version.

## Audit (read-only)

```bash
node scripts/base-audit.mjs
# or via the skill: /wp-plugin-base audit
```

Reports three classes per managed file:

- **unchanged** — local hash matches the lock.
- **locally modified** — hash differs from the lock but the file is also
  unchanged upstream: your customization; it is preserved on upgrade.
- **upgrade available** — the base release has a different hash: an upgrade
  would change the file.

It also reports the latest base release tag and whether `baseVersion` is
behind.

## Upgrade (controlled, via PR)

```bash
node scripts/base-upgrade.mjs --to v1.2.0
# or via the skill: /wp-plugin-base upgrade --to v1.2.0
```

The upgrade:

1. fetches the managed files from `quasipapa/wp-plugin-base` at the target tag,
2. applies them on a new branch `base/upgrade-v1.2.0`,
3. keeps locally modified files and reports them as conflicts to review,
4. updates `base-lock.json` to the new base version and hashes,
5. opens a pull request; CI must be green before merge.

Never edit managed files directly — a direct edit is exactly what `audit`
flags as drift.
