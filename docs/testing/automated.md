# Automated verification

- `tests/unit/`: PHPUnit.
- `src/*.test.{js,jsx}` / `src/*.browser.test.jsx` / `assets/js/*.test.js`:
  Vitest (jsdom / Browser Mode).
- `tests/**/*.pw.js`: Playwright.
- `scripts/*.test.mjs`: Node test runner contracts (`npm run test:ci`).
