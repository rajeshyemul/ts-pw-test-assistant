# ts-pw-ui-framework_AI

![Playwright](https://img.shields.io/badge/Playwright-1.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Playwright + TypeScript automation framework for modern Quality Engineering, designed as the practical implementation platform for:

**The Complete Agentic AI for Quality Engineering Series: From Playwright Framework Architect to Agentic QE Architect**

This repository starts with a clean, extensible UI automation framework and provides a foundation for exploring how agentic AI can support real QE work: framework design, test authoring, maintainability, reporting, debugging, and future intelligent automation workflows.

It is designed around:

- Playwright test execution
- Page Object Model for UI workflows
- fixture-based dependency injection
- reusable action, wait, assertion, logging, and reporting helpers
- optional database setup and query utilities
- HTML, JSON, JUnit, and Allure reporting

## Why This Repository Exists

The goal of this project is not only to run UI tests. It is a hands-on learning platform for building QE capability in layers:

1. Start with a production-style Playwright + TypeScript framework.
2. Understand the architecture choices that keep automation maintainable.
3. Extend the framework with real application workflows.
4. Use the framework as the base for practical Agentic AI for QE experiments.
5. Progress from framework consumer to framework architect, then toward Agentic QE architecture.

## Read This First

For the full internal design, usage model, extension guidance, and layer-by-layer explanation, read:

- [Framework Handbook](docs/framework-architecture.md)

Use this `README.md` for setup, daily usage, and repository navigation.

## Current Application Under Test

The framework currently uses `Restful-Booker-Platform` as the reference application:

- UI: `https://automationintesting.online`
- Admin username: `admin`
- Admin password: `password`

## Framework Philosophy

The intended usage model is:

- tests orchestrate workflows
- fixtures inject typed dependencies
- page objects own UI behavior
- helper classes own low-level browser mechanics
- database utilities own direct database access
- reporting hooks capture execution evidence automatically

For day-to-day usage, import `test` or `uiTest` from `@fixtures/UiFixture`.

## Repository Structure

```text
ts-pw-ui-framework_AI/
├── docs/
│   └── framework-architecture.md
├── src/
│   ├── config/
│   ├── fixtures/
│   ├── helper/
│   ├── pages/
│   ├── support/
│   └── utils/
├── tests/
│   └── example/
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```

## Series Usage

This framework is intended to support practical articles and implementation exercises in the Agentic AI for Quality Engineering series, including:

- Playwright framework architecture
- Page Object Model and fixture design
- reusable action, wait, assertion, and reporting layers
- configuration and environment management
- database validation patterns
- test evidence and reporting strategy
- future agentic QE workflows built on top of a stable automation base

## Prerequisites

- Node.js 18+
- npm
- Playwright browser binaries
- Java runtime if you want to generate Allure reports
- MSSQL connection details only when database utilities are used

## Installation

```bash
git clone https://github.com/rajeshyemul/ts-pw-ui-framework_AI.git
cd ts-pw-ui-framework_AI
npm install
npx playwright install
```

## Environment Configuration

The framework is configured through environment variables or a local `.env` file.

Common values:

- `ENVIRONMENT=dev|qa|stage|prod|local`
- `BROWSER=chromium|firefox|webkit`
- `HEADLESS=true|false`
- `RETRIES=0|1|2`
- `WORKERS=1|2|...`
- `TEST_TIMEOUT=60000`
- `UI_BASE_URL=https://automationintesting.online`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=password`
- `LOG_LEVEL=debug|info|warn|error`
- `CI=true|false`

Database values:

- `DB_SERVER`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `ENVIRONMENT_SUFFIX`

## Main Commands

```bash
# Full run
npm test

# Run UI suites
npm run test:ui

# Run smoke tests
npm run test:smoke

# Run integration-tagged tests
npm run test:integration

# Run in headed mode
npm run test:headed

# Run in debug mode
npm run test:debug

# Type-check the repository
npm run type-check

# Lint the repository
npm run lint

# Run the standard quality gate
npm run validate

# Format the repository
npm run format

# Generate HTML report
npm run report:html

# Generate and open Allure report
npm run report:allure
```

## Writing Tests

```ts
import { test } from "@fixtures/UiFixture";
import { HomePage } from "@pages/homePage";

test("loads the public room catalog @smoke", async ({ actions }) => {
  const homePage = new HomePage(actions);

  await homePage.navigate();
  await homePage.verifyPageLoaded();
  await homePage.verifyRoomCatalogVisible();
});
```

The fixture provides:

- `actions`
- `assertUtils`
- `expectUtils`

Tests create only the page objects they need. This keeps the base fixture lightweight even when a real project grows to many pages.

For database-enabled tests, import from `@fixtures/DBFixture`:

```ts
import { test } from "@fixtures/DBFixture";

test("verifies database state", async ({ db }) => {
  const result = await db.executeMSSQLQuery("SELECT TOP 1 * FROM ExampleTable");
});
```

## Runtime Flow

1. `playwright.config.ts` loads browser, timeout, reporter, and artifact settings.
2. Global setup logs the start of the framework run.
3. Tests import the UI fixture.
4. Fixtures create `PageActions`, assertion helpers, and page objects.
5. Page objects use helper classes for browser interactions and assertions.
6. `PageSetup.ts` attaches screenshots, page source, URL, title, and video on failure.
7. Reports are written to timestamped folders under `reports/`.
8. Global teardown logs the end of the framework run.

## Extending The Framework

When adding new business coverage:

- add page objects under `src/pages`
- keep selectors under `src/support/locators`
- add reusable actions or waits under `src/helper`
- use database utilities under `src/utils/database` only when direct database validation is part of the scenario
- use `@fixtures/DBFixture` when a test needs database connection lifecycle management
- instantiate page objects in tests or create feature-specific fixtures only when repeated setup becomes useful
- keep tests focused on workflows, not low-level mechanics

## Repository

- GitHub: [rajeshyemul/ts-pw-ui-framework_AI](https://github.com/rajeshyemul/ts-pw-ui-framework_AI)
- Author: Rajesh Yemul
