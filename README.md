# ts-pw-test-assistant

![Playwright](https://img.shields.io/badge/Playwright-1.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![AI](https://img.shields.io/badge/AI-Agentic_Test_Generation-purple)
![License](https://img.shields.io/badge/license-MIT-green)

**AI-powered Quality Engineering assistant built on an existing Playwright + TypeScript automation framework.**

This repository is the practical implementation platform for:

**The Complete Agentic AI for Quality Engineering Series: From Playwright Framework Architect to Agentic QE Architect**

The project explores how AI agents can work with a real UI automation framework to transform software requirements into executable, framework-aware Playwright tests.

The objective is not to replace the automation framework with AI.

Instead, AI operates **on top of a stable Playwright + TypeScript framework**, using the framework's existing Page Objects, fixtures, helpers, locators, and conventions to generate tests that fit the codebase.

---

## What This Project Does

The current implementation provides an AI-assisted test-generation pipeline:

```text
JIRA Ticket
    │
    ▼
Requirement Extraction
    │
    ├── jira_data.json
    └── test_requirements_output.md
    │
    ▼
Test Case Generation Agent
    │
    ├── Test Case Specification
    └── Test Coverage Matrix
    │
    ▼
E2E Test Code Generation Agent
    │
    ├── Discover existing Playwright framework
    ├── Discover Page Objects
    ├── Discover fixtures and framework capabilities
    └── Generate Playwright TypeScript
    │
    ▼
E2E Quality Check
    │
    ├── Semantic assertion validation
    ├── TypeScript type-check
    └── ESLint validation
    │
    ▼
Executable Playwright Test
```

The current implementation has been validated using a complete `APP-2` generation cycle from a clean state.

---

# Current Capabilities

## 1. JIRA Requirement Extraction

The workflow can retrieve a JIRA issue and create a structured requirement payload.

Example:

```text
test_artifacts/
└── admin/
    └── APP-2/
        └── phases/
            ├── jira_data.json
            └── test_requirements_output.md
```

The extracted information can include:

* JIRA issue key
* summary
* issue type
* priority
* status
* description
* acceptance criteria
* affected components

The JIRA data becomes the input to the downstream test-generation workflow.

---

## 2. AI Test Case Generation

The `test_case_generation` agent converts the requirement analysis into structured test cases.

Output:

```text
test_artifacts/
└── admin/
    └── APP-2/
        ├── test_cases/
        │   └── APP-2_test_cases.md
        │
        └── test_coverage_matrix.md
```

The generated test cases contain information such as:

* Test Case ID
* Test title
* Scenario description
* Priority
* Test tags
* Preconditions
* Test steps
* Expected results
* Acceptance-criteria mapping
* Framework capability mapping

The test-generation process follows the four-phase thinking framework used by the reference agentic test-generation solution:

1. **Ecosystem Contextualization**
2. **User Reality**
3. **System Integration**
4. **Value Delivery**

The purpose is to prevent the AI from generating tests based only on the happy-path interpretation of a requirement.

---

# 3. Framework-Aware Playwright Test Generation

The E2E code-generation agent consumes the generated test cases and creates executable Playwright TypeScript tests.

The important design principle is:

> **The AI discovers the existing automation framework instead of inventing a new one.**

Before generating a test, the agent can inspect:

```text
src/
├── pages/
├── fixtures/
├── support/
│   └── locators/
├── helper/
└── utils/

tests/
```

This allows generated tests to reuse existing:

* Page Objects
* Page Object methods
* fixtures
* browser actions
* assertion utilities
* locators
* reporting conventions
* test tags
* framework patterns

For example, a generated test can use:

```typescript
import { test } from "@fixtures/UiFixture";
import { AdminLoginPage } from "@pages/adminLoginPage";
```

rather than creating low-level Playwright interactions directly inside the test.

---

# 4. Semantic Test Validation

A test that compiles is not necessarily a useful test.

The project therefore includes explicit rules to prevent content-free test generation.

For example, a negative-path scenario should not simply do:

```typescript
await adminLoginPage.navigate();
await adminLoginPage.verifyLoginFormVisible();
```

when the requirement is to validate invalid credentials.

The generated test must actually exercise the target behaviour:

```typescript
await adminLoginPage.navigate();
await adminLoginPage.verifyLoginFormVisible();
await adminLoginPage.loginWithInvalidCredentials(
  "invalidUser",
  "wrongPassword",
);
await adminLoginPage.verifyInvalidCredentialsErrorVisible();
```

The E2E generation rules therefore enforce:

* target actions must be executed
* meaningful assertions must be present
* negative scenarios must use invalid inputs
* expected error states must be verified
* setup/navigation alone is not considered sufficient coverage

This is an important part of the project's Agentic QE approach.

---

# 5. Automated Code Quality Validation

Generated Playwright code is passed through the existing project quality gates.

```bash
npm run type-check
npm run lint
```

The quality-check stage verifies:

```text
Generated .spec.ts
       │
       ├── TypeScript validation
       │
       └── ESLint validation
```

If generated code contains technical issues, the quality-check process can analyse the reported errors and correct the generated test.

The objective is to ensure that AI-generated code conforms to the existing repository's technical standards before it is considered ready.

---

# Current End-to-End Example

The current implementation has been validated using JIRA ticket `APP-2`.

The complete generation flow was:

```text
APP-2
 │
 ▼
Live JIRA extraction
 │
 ▼
jira_data.json
 │
 ▼
Requirement analysis
 │
 ▼
test_requirements_output.md
 │
 ▼
AI Test Case Generation
 │
 ├── APP-2_test_cases.md
 └── test_coverage_matrix.md
 │
 ▼
AI Playwright Code Generation
 │
 ▼
tests/admin/APP-2.spec.ts
 │
 ▼
Semantic validation
 │
 ▼
npm run type-check
 │
 ▼
npm run lint
 │
 ▼
PASS
```

The generated test contains both positive and negative authentication scenarios:

```typescript
test(
  "Successful Admin Login and Redirect to Rooms Portal @smoke @regression @P1 @APP-2",
  async () => {
    await adminLoginPage.navigate();
    await adminLoginPage.verifyLoginFormVisible();
    await adminLoginPage.loginAsAdmin();
    await adminRoomsPage.verifyPageLoaded();
    await adminRoomsPage.verifyRoomManagementVisible();
  },
);

test(
  "Invalid Admin Credentials Error Banner Validation @regression @P2 @APP-2",
  async () => {
    await adminLoginPage.navigate();
    await adminLoginPage.verifyLoginFormVisible();
    await adminLoginPage.loginWithInvalidCredentials(
      "invalidUser",
      "wrongPassword",
    );
    await adminLoginPage.verifyInvalidCredentialsErrorVisible();
  },
);
```

---

# Underlying Playwright Framework

The AI layer is built on top of the existing Playwright + TypeScript framework.

The framework provides the foundation for:

* browser automation
* Page Object Model
* fixture-based dependency injection
* reusable browser actions
* wait handling
* assertions
* logging
* screenshots
* video
* test reporting
* database utilities

The intended architecture remains:

```text
                 AI TEST GENERATION
                        │
                        ▼
              ┌───────────────────┐
              │ Playwright Tests  │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │   Page Objects    │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │ Fixtures / Helper │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │    Playwright     │
              └───────────────────┘
```

AI is an additional layer, not a replacement for these foundations.

---

# Repository Structure

```text
ts-pw-test-assistant/
│
├── config/
│   ├── agents/
│   │   ├── test_case_generation.md
│   │   ├── e2e_code_generation_agent.md
│   │   └── e2e_quality_check_agent.md
│   │
│   └── rules/
│       ├── test_case_rules/
│       │   └── unified_test_generation_rules.md
│       │
│       └── e2e_rules/
│           ├── e2e_test_case_guidelines_ts_pw.yaml
│           └── e2e_quality_check_rules.yaml
│
├── docs/
│   └── framework-architecture.md
│
├── src/
│   ├── config/
│   ├── fixtures/
│   ├── helper/
│   ├── pages/
│   ├── support/
│   │   └── locators/
│   └── utils/
│
├── tests/
│   └── admin/
│
├── test_artifacts/
│
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```

> The agent and rule structure will evolve as additional stages of the reference agentic workflow are implemented.

---

# Current Application Under Test

The framework currently uses **Restful-Booker-Platform** as the reference application.

```text
UI:
https://automationintesting.online

Admin username:
admin

Admin password:
password
```

---

# Framework Usage

For regular Playwright tests:

```typescript
import { test } from "@fixtures/UiFixture";
import { HomePage } from "@pages/homePage";

test("loads the public room catalog @smoke", async ({ actions }) => {
  const homePage = new HomePage(actions);

  await homePage.navigate();
  await homePage.verifyPageLoaded();
  await homePage.verifyRoomCatalogVisible();
});
```

The UI fixture provides the common framework dependencies required by tests.

Tests should remain focused on business workflows while Page Objects and helper classes own the implementation details.

---

# Environment Configuration

The framework uses environment variables or a local `.env` file.

Common configuration:

```text
ENVIRONMENT=dev|qa|stage|prod|local
BROWSER=chromium|firefox|webkit
HEADLESS=true|false
RETRIES=0|1|2
WORKERS=1|2|...
TEST_TIMEOUT=60000
UI_BASE_URL=https://automationintesting.online
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
LOG_LEVEL=debug|info|warn|error
CI=true|false
```

Database configuration is required only for tests that use database utilities:

```text
DB_SERVER
DB_PORT
DB_NAME
DB_USERNAME
DB_PASSWORD
ENVIRONMENT_SUFFIX
```

---

# Installation

```bash
git clone https://github.com/rajeshyemul/ts-pw-test-assistant.git
cd ts-pw-test-assistant

npm install
npx playwright install
```

---

# Main Commands

## Run tests

```bash
npm test
```

## Run UI tests

```bash
npm run test:ui
```

## Run smoke tests

```bash
npm run test:smoke
```

## Run headed

```bash
npm run test:headed
```

## Debug

```bash
npm run test:debug
```

## Type-check

```bash
npm run type-check
```

## Lint

```bash
npm run lint
```

## Run quality validation

```bash
npm run validate
```

## Format

```bash
npm run format
```

## HTML report

```bash
npm run report:html
```

## Allure report

```bash
npm run report:allure
```

---

# Agentic QE Development Roadmap

The repository is being developed incrementally.

### Implemented

```text
JIRA Requirement Extraction
        ↓
Requirement Analysis
        ↓
Test Case Generation
        ↓
Coverage Matrix
        ↓
Playwright Test Code Generation
        ↓
Semantic Assertion Enforcement
        ↓
TypeScript Validation
        ↓
ESLint Validation
```

### Planned / Under Evaluation

Additional components from the reference agentic test-generation solution may be introduced after the core generation pipeline is proven:

```text
E2E Coverage Validation
        ↓
Test Execution Agent
        ↓
Execution Result Analysis
        ↓
Test Reporting
        ↓
Pull Request Automation
        ↓
Workflow Orchestration
```

These components are intentionally **not treated as implemented capabilities until they are built and verified**.

---

# Design Principles

## 1. AI should use the framework, not bypass it

Generated tests should reuse the existing framework architecture.

```text
Good:

AI
 ↓
Existing Page Object
 ↓
Existing helper
 ↓
Playwright
```

Not:

```text
AI
 ↓
raw locators everywhere
 ↓
duplicated browser logic
```

## 2. Generated code must be meaningful

Compilation is necessary but not sufficient.

A generated test must exercise the behaviour described by the requirement and contain meaningful assertions.

## 3. Framework discovery should be dynamic

The AI should inspect the repository rather than assuming specific Page Objects or methods.

This makes the approach applicable as the framework grows.

## 4. Keep responsibilities separated

```text
Requirement Agent
        ↓
Test Case Agent
        ↓
Code Generation Agent
        ↓
Quality Check
        ↓
Execution
```

Each stage has a defined responsibility and produces an identifiable artifact.

## 5. Build incrementally

Every stage should be independently verified before additional agents are introduced.

The project intentionally avoids adding an agent simply because the reference implementation contains one. Each component must provide a clear benefit to the Playwright + TypeScript workflow.

---

# Learning Objective

This repository is also an implementation laboratory for understanding the progression from traditional test automation to Agentic QE.

```text
Playwright Engineer
       ↓
Framework Engineer
       ↓
Framework Architect
       ↓
AI-assisted Test Automation
       ↓
Agentic Test Generation
       ↓
Agentic QE Architect
```

The goal is to understand not only how to generate tests with AI, but also **where AI should interact with a QE architecture and where it should not**.

---

# Documentation

Detailed framework architecture and implementation guidance:

* `docs/framework-architecture.md`

Agent and workflow configuration:

* `config/agents/`
* `config/rules/`

Generated QE artifacts:

* `test_artifacts/`

---

# Repository

GitHub: [rajeshyemul/ts-pw-test-assistant](https://github.com/rajeshyemul/ts-pw-test-assistant)

Author: **Rajesh Yemul**
