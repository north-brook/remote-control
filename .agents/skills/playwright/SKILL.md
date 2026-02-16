---
name: playwright
description: Set up and run Playwright end-to-end tests.
---

# Playwright

## Setup

```bash
bun add -D @playwright/test
bunx playwright install
```

## Config

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Writing Tests

```ts
// tests/home.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=About');
  await expect(page).toHaveURL('/about');
});
```

### Page Object Pattern

```ts
// tests/pages/login.ts
import { type Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto('/login'); }
  async login(email: string, password: string) {
    await this.page.fill('[name=email]', email);
    await this.page.fill('[name=password]', password);
    await this.page.click('button[type=submit]');
  }
}
```

## Running

```bash
bunx playwright test                 # Run all tests
bunx playwright test --ui            # Interactive UI mode
bunx playwright test tests/home.spec.ts  # Single file
bunx playwright show-report          # View HTML report
```

## CI Considerations

- Use `bunx playwright install --with-deps` in CI to install browser deps.
- Set `forbidOnly: !!process.env.CI` to fail if `.only` is left in.
- Use `reporter: 'github'` for inline PR annotations.
- Single worker in CI (`workers: 1`) for stability.
