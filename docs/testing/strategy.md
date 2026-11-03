# Test strategy

Cheapest reliable layer per risk:

| Layer | Entry point |
| --- | --- |
| Format/lint/static analysis | `npm run check` |
| PHPUnit | `npm run test:php` |
| Vitest jsdom project | `npm run test:js` |
| Vitest Browser Mode (real Chromium) | `npm run test:js:browser` |
| Playwright (WordPress E2E, responsive, accessibility) | `npm run test:browser` |
| Full local gate (wp-env, Plugin Check, all browser suites) | `npm run test:local` |
