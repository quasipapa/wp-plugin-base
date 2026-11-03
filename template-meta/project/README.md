---
scope: project
---

# {{NAME}}

{{NAME}} is a WordPress plugin built on
[wp-plugin-base](https://github.com/quasipapa/wp-plugin-base) (base version:
see `template-meta/base-lock.json`).

## Documentation layout

- `docs/` — this project's documentation (see
  [docs/index.md](docs/index.md)); `docs/using-the-base/` explains how to work
  with the base and is refreshed by base upgrades.
- Documentation about the base itself (architecture, ADRs, changelog) lives in
  the [wp-plugin-base repository](https://github.com/quasipapa/wp-plugin-base/tree/main/template-docs),
  not here.

## Development

```bash
npm install
npm run env:start
npm run check
npm run test:local
```

## License

{{LICENSE}}.
