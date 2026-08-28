# Playwright UI Framework Handbook

This handbook explains the Playwright + TypeScript UI automation framework as it exists in this repository.

The framework focuses on browser UI validation, page objects, reusable helper layers, reporting, and optional MSSQL database checks.

---

## 1. Purpose

The framework solves a common UI automation problem: tests become hard to maintain when browser actions, selectors, assertions, waits, configuration, and reporting are mixed directly into test files.

This framework keeps those responsibilities separate:

- tests express scenario intent
- fixtures inject ready-to-use dependencies
- page objects own page behavior
- helper classes own low-level browser mechanics
- assertion helpers standardize checks
- database utilities own direct database access
- runtime hooks own setup, teardown, and failure evidence

---

## 2. High-Level Architecture

```text
Tests
  -> Fixtures
  -> Page Objects
  -> UI Helpers / Assertions / Waits
  -> Runtime / Configuration / Reporting
  -> Optional Database Utilities
```

| Layer      | Responsibility                                              |
| ---------- | ----------------------------------------------------------- |
| Tests      | express business workflow intent                            |
| Fixtures   | create and inject framework objects                         |
| Pages      | expose page-specific actions and assertions                 |
| Helpers    | wrap browser actions, waits, and locator handling           |
| Assertions | standardize UI and value checks                             |
| Database   | execute MSSQL setup and validation queries                  |
| Runtime    | configure browsers, reports, artifacts, setup, and teardown |

---

## 3. Repository Structure

```text
playwright-ui-framework/
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
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

Important areas:

- `src/config` contains runtime configuration, setup, teardown, and browser project creation.
- `src/fixtures` contains dependency injection for tests.
- `src/pages` contains page objects.
- `src/helper` contains actions, waits, assertions, logging, and reporting helpers.
- `src/support` contains constants, enums, locators, and shared model types.
- `src/utils/database` contains direct database helpers.
- `tests` contains scenario code.

---

## 4. Runtime Layer

Main files:

- `playwright.config.ts`
- `src/config/PlaywrightConfigFactory.ts`
- `src/config/global-setup.ts`
- `src/config/global-teardown.ts`
- `src/config/PageSetup.ts`

The runtime layer defines:

- test directory
- timeout
- retries
- workers
- browser project
- base URL
- screenshot, video, and trace behavior
- report locations
- global setup and teardown
- failure artifact capture

`PlaywrightConfigFactory` keeps the main Playwright config small. It resolves browser selection, reporter setup, output folders, and use options from one place.

`PageSetup.ts` hooks into the Playwright lifecycle. On failure it attaches useful evidence such as:

- screenshot
- page source
- current URL
- page title
- error details
- video when available

---

## 5. Configuration Layer

Main file:

- `src/config/ConfigManager.ts`

`ConfigManager` is the single source of truth for environment values.
It loads `.env` through `dotenv` when the configuration module is imported, so local and CI runs use the same configuration access path.

It manages:

- environment name
- UI base URL
- selected browser
- headless mode
- log level
- debug mode
- CI mode
- admin username
- admin password
- optional Playwright browser install path, when supplied through environment variables

Tests and page objects should not read `process.env` directly when a `ConfigManager` method exists. Centralizing configuration prevents duplicated defaults and inconsistent runtime behavior.

The example tests in this repository target `https://automationintesting.online`. If a local `.env` points `UI_BASE_URL` or `BASE_URL` to another application, run the sample validation with an explicit override:

```bash
UI_BASE_URL=https://automationintesting.online npx playwright test --reporter=list
```

---

## 6. Fixture Layer

Main file:

- `src/fixtures/UiFixture.ts`

Fixtures are the framework's dependency injection mechanism.

The UI fixture currently provides:

- `actions`

Example:

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

This keeps the base fixture focused on reusable framework dependencies. Tests create only the page objects they need for the scenario. If a project has repeated setup for a feature area, create a feature-specific fixture instead of adding every page object to the global UI fixture.

Database-enabled tests should import from `src/fixtures/DBFixture.ts`. That fixture extends the UI fixture and adds a `db` dependency that owns database connection setup and teardown.

```ts
import { test } from "@fixtures/DBFixture";

test("verifies database state", async ({ db }) => {
  const result = await db.executeMSSQLQuery("SELECT TOP 1 * FROM ExampleTable");
});
```

---

## 7. Page Object Layer

Main files:

- `src/pages/base/BasePage.ts`
- `src/pages/homePage.ts`
- `src/pages/adminLoginPage.ts`
- `src/pages/adminRoomsPage.ts`

Page objects own page-specific behavior:

- navigation
- page readiness checks
- page-specific actions
- page-specific assertions

`BasePage` standardizes common mechanics:

- `navigate()`
- `verifyPageLoaded()`
- `reload()`
- locator helpers
- access to action, wait, and assertion helpers

Selectors live outside page objects under `src/support/locators`. This makes selector updates smaller and keeps page classes focused on behavior.

Locator constants should be specific enough for Playwright strict mode. Prefer semantic or scoped selectors such as `h2:has-text("Our Rooms")`, roles, labels, test IDs, or stable form selectors over broad text selectors when the same text can appear multiple times on the page.

---

## 8. UI Helpers

Main files:

- `src/helper/actions/PageActions.ts`
- `src/helper/actions/UIActions.ts`
- `src/helper/actions/LocatorFactory.ts`
- `src/helper/actions/internal/UIElementActions.ts`
- `src/helper/actions/internal/EditBoxActions.ts`
- `src/helper/actions/internal/DropDownActions.ts`
- `src/helper/actions/internal/CheckboxActions.ts`
- `src/helper/waits/WaitUtils.ts`

The helper layer keeps raw Playwright operations out of tests and mostly out of page methods.
`UIActions` is the public entry point for grouped UI operations. The classes under
`src/helper/actions/internal` are implementation details and should not be imported directly.

Preferred page-object usage:

- use `this.actions` for page and browser-context behavior
- use `this.ui.element` for general element interactions
- use `this.ui.editBox`, `this.ui.dropdown`, and `this.ui.checkbox` for control-specific interactions
- use `this.waitUtils` for wait orchestration
- use `this.expectUtils` for locator and page assertions
- use `this.assertUtils` for plain value assertions

`LocatorFactory` accepts selectors and existing Playwright locators, so helper methods can support both without each page needing custom conversion code.

---

## 9. Assertion Layer

Main files:

- `src/helper/assertions/ui/ExpectUtils.ts`
- `src/helper/assertions/ui/AssertUtils.ts`

`ExpectUtils` wraps Playwright locator and page assertions.

Examples:

- element visible
- element hidden
- element attached
- text equals
- text contains
- page URL
- page title

`AssertUtils` wraps plain value assertions.

Examples:

- equality
- truthiness
- greater than
- greater than or equal
- null checks
- array contains

This split keeps locator assertions and ordinary value assertions clear.

---

## 10. Database Layer

Main files:

- `src/fixtures/DBFixture.ts`
- `src/config/DBSetup.ts`
- `src/support/constants/DBConstants.ts`
- `src/support/models/queriesTypes.ts`
- `src/utils/database/DBUtils.ts`
- `src/utils/database/DBActions.ts`
- `src/utils/database/DBAssertUtils.ts`

The database layer supports MSSQL validation and setup work.

Responsibilities:

- build database connection settings from environment variables
- establish and close the shared MSSQL connection pool
- execute raw SQL
- build common select, insert, update, and delete statements
- verify query execution success

Expected environment variables:

- `DB_SERVER`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `ENVIRONMENT_SUFFIX`

Use database helpers only when the scenario genuinely needs backend state validation. UI tests should still prove user-visible behavior through the browser first.

---

## 11. Reporting And Logging

Main files:

- `src/helper/logger/Logger.ts`
- `src/helper/reporting/AllureReporter.ts`
- `src/helper/reporting/StepRunner.ts`
- `src/helper/reporting/GenerateReports.ts`
- `src/helper/reporting/CustomReporterConfig.ts`

Reporting outputs include:

- Playwright HTML report
- JSON report
- JUnit report
- Allure results
- traces
- screenshots
- videos
- framework logs

`StepRunner` gives framework actions readable report steps. Page methods should use business-readable step names so failures are easier to understand.
When `logResult` is enabled, `StepRunner` logs only meaningful returned values and skips `undefined` results from void workflow steps.

---

## 12. Static Analysis Standards

Main files:

- `eslint.config.mjs`
- `src/customEsLintRules`

The framework uses ESLint, TypeScript strict mode, Prettier, and custom framework rules.

Custom rules enforce:

- no duplicate test titles
- no duplicate tags
- no direct imports from internal action helper classes
- no unused page locators under `src/support/locators`

Shared constants under `src/support/constants` are reusable framework catalogs and are intentionally exempt from the unused-locator rule. Do not add arbitrary values there; add a constant only when it represents a reusable framework concept, runtime path, configuration value, or shared domain value.

---

## 13. Adding A New Page

1. Add selectors under `src/support/locators`.
2. Create a page class under `src/pages`.
3. Extend `BasePage`.
4. Define `pageUrl`, `pageTitle`, and `pageReadySelector`.
5. Implement page actions using helper classes.
6. Instantiate the page object in the tests that need it.
7. Add a feature-specific fixture only when repeated setup justifies it.

Example shape:

```ts
export class ExamplePage extends BasePage {
  protected pageUrl = "/example";
  protected pageTitle = /Example/i;
  protected pageReadySelector = ExampleLocators.HEADING;

  async verifyReady(): Promise<void> {
    await this.expectUtils.expectElementToBeVisible(
      ExampleLocators.HEADING,
      "example heading",
      "Example heading is not visible",
    );
  }
}
```

---

## 14. Quality Gate

Before opening a pull request or sharing framework changes, run:

```bash
npx prettier --check .
npm run type-check
npm run lint
```

For a browser smoke check, run:

```bash
npm run test:smoke
```

For the repository sample tests, use the sample base URL explicitly when your local `.env` targets another application:

```bash
UI_BASE_URL=https://automationintesting.online npx playwright test --reporter=list
```

If `PLAYWRIGHT_BROWSERS_PATH=0` is set, install browsers into the project-local Playwright path:

```bash
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install
```
