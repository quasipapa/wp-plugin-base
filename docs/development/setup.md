---
scope: project
---

# Development setup

Requires Docker, Node.js and npm per [versions](versions.md).

```bash
npm install
npm run composer:install
npm run env:start    # http://localhost:8888, admin / password
npm run check        # source gate
npm run test:local   # full local gate incl. WordPress integration and browsers
```
