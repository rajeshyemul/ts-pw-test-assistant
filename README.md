# ts-pw-test-assistant

An artifact-driven, multi-agent AI Quality Engineering system built on Playwright + TypeScript.

This repository is the practical implementation platform for:

**The Complete Agentic AI for Quality Engineering Series: From Playwright Framework Architect to Agentic QE Architect**

The project demonstrates how a collection of specialized AI agents can work with an existing Playwright + TypeScript automation framework to transform a JIRA requirement into:

* structured test scenarios
* acceptance-criteria coverage
* framework-aware Playwright tests
* semantic and technical quality validation
* live browser execution
* execution evidence
* a consolidated QE report
* release-gated Git changes

The AI layer does not replace the Playwright automation framework.

Instead, it operates on top of the framework and dynamically discovers and reuses its existing Page Objects, fixtures, locators, helpers, assertions, and conventions.

---

## What This Project Does

A user can provide a request such as:

```text
Generate E2E tests for JIRA APP-5.
```

The system processes the request through a controlled multi-agent workflow:

```text
USER PROMPT
     │
     ▼
WORKFLOW ORCHESTRATOR
     │
     ▼
JIRA REQUIREMENT EXTRACTION
     │
     ▼
REQUIREMENT ANALYSIS
     │
     ▼
TEST CASE GENERATION
     │
     ▼
COVERAGE MATRIX
     │
     ▼
EXISTING TEST VALIDATION
     │
     ├────────────── Framework Gap ──────────────► STOP
     │
     ▼
E2E CODE GENERATION
     │
     ▼
QUALITY CHECK
     │
     ├── Failure ──► Fix / Stop
     │
     ▼
LIVE PLAYWRIGHT EXECUTION
     │
     ┌────────┴────────┐
     │                 │
   Failed            Passed
     │                 │
     └────────┬────────┘
              ▼
      REPORT SYNTHESIS
     │
     ┌────────┼────────┐
     │        │        │
  BLOCKED  WARNINGS  PASSED
     │        │        │
   STOP     STOP       ▼
                 PR SUBMISSION
                       │
                       ▼
             BRANCH / COMMIT / PUSH
```

The workflow is controlled by explicit quality gates and stop conditions rather than treating a successful AI response or a green Playwright exit code as sufficient evidence.

---

## Core Architecture

The system is composed of specialized agents:

```text
config/agents/
├── jira_extractor.md
├── test_case_generation.md
├── e2e_validation_agent.md
├── e2e_code_generation_agent.md
├── e2e_quality_check_agent.md
├── e2e_test_executor_agent.md
├── report_generation_agent.md
├── pr_submitter_agent.md
└── workflow_orchestrator.md
```

Each agent has a focused responsibility:

| Agent | Responsibility |
| :--- | :--- |
| **JIRA Requirement Extractor** | Retrieves and structures JIRA requirements |
| **Test Case Generator** | Converts requirements into structured test scenarios |
| **E2E Validation Agent** | Determines existing automation coverage and framework capability |
| **Playwright Code Generator** | Converts test cases into framework-aware Playwright tests |
| **Quality Checker** | Validates and repairs generated TypeScript and ESLint issues |
| **Test Executor** | Executes generated tests and audits runtime behaviour |
| **Report Generator** | Synthesizes requirements, coverage, validation, quality, and execution evidence |
| **PR Submitter** | Applies release gates and prepares/pushes verified changes |
| **Workflow Orchestrator** | Coordinates the complete multi-agent workflow |

---

## The Most Important Architectural Principle

> **Agents communicate through persisted artifacts.**

The workflow does not depend on transient LLM conversation memory to pass important state between stages.

Instead, every stage produces an explicit artifact:

```text
JIRA API
   │
   ▼
jira_data.json
   │
   ▼
test_requirements_output.md
   │
   ▼
APP-5_test_cases.md
   │
   ▼
test_coverage_matrix.md
   │
   ▼
e2e_validation_output.md
   │
   ▼
APP-5.spec.ts
   │
   ▼
e2e_execution_report.md
   │
   ▼
final_test_generation_report.md
   │
   ▼
pr_submission_report.md
```

This provides:

* reproducibility
* traceability
* explicit agent hand-offs
* auditable decisions
* deterministic stop conditions
* evidence that downstream agents can inspect

The artifact directory therefore acts as the persistent state of an individual JIRA workflow.

---

## Complete Workflow

### Phase 1 — JIRA Requirement Extraction

The workflow starts with a JIRA issue key.

Example: `APP-5`

The JIRA extraction agent retrieves the issue through the JIRA REST API.

It extracts information such as:
* issue key
* summary
* description
* issue type
* priority
* status
* acceptance criteria
* affected components

The agent creates:
`test_artifacts/home/APP-5/phases/jira_data.json`  
and  
`test_artifacts/home/APP-5/phases/test_requirements_output.md`

#### Example
A requirement might state:
> APP-5 Public room catalog must display room cards. AC1: Three room cards should be displayed. AC2: Each room card should display its price, features, and description.

The structured JIRA artifact becomes the machine-readable contract for the next stage.

---

### Phase 2 — Test Case Generation

The test case generation agent consumes:
`jira_data.json` and `test_requirements_output.md`

It applies the project's test-generation rules and four-phase thinking framework:

1. **Phase 1 — Ecosystem Contextualization**: Understand where the feature exists in the application and automation ecosystem.
2. **Phase 2 — User Reality**: Consider how a real user interacts with the feature, including positive and negative scenarios.
3. **Phase 3 — System Integration**: Understand the system behaviour surrounding the requirement.
4. **Phase 4 — Value Delivery**: Ensure the resulting scenarios actually validate the business behaviour described by the requirement.

The agent produces:
`test_artifacts/home/APP-5/test_cases/APP-5_test_cases.md`  
and  
`test_artifacts/home/APP-5/test_coverage_matrix.md`

#### Example
* `TC-APP-5-001` Public Room Catalog Displays Three Room Cards (AC: AC1, Priority: P1)
* `TC-APP-5-002` Room Cards Display Price, Features and Description (AC: AC2, Priority: P2)

---

### Phase 3 — Existing E2E Validation

Before generating code, the E2E validation agent examines the existing automation repository.

It searches:
`tests/`, `src/pages/`, `src/fixtures/`, `src/support/locators/`

The objective is to answer two questions:
1. Does equivalent test coverage already exist?
2. Does the framework contain the capabilities required to implement the scenario?

The validation agent produces:
`test_artifacts/home/APP-5/phases/e2e_validation_output.md`

The validation rules require evidence-based findings.

For example:
* `TC-APP-5-001` Coverage: **`COVERED`** | Evidence: `tests/home/APP-5.spec.ts:13` | Capability: `verifyRoomCatalogVisible()`

The validation stage also performs subtlety checks where broad locators or weak assertions could make an apparently passing test unreliable.

#### Framework Gap Protection
A critical rule is:
> **The AI must not invent Page Object methods, selectors, or framework capabilities that do not exist.**

If the required capability cannot be found, the workflow produces `framework_gap_report.md` and stops.

#### Example
* Requirement: Verify booking confirmation message.
* Required capability: `BookingPage.verifyConfirmationMessage()`
* Discovery: Method not found.
* Result: **`FRAMEWORK GAP`** -> Pipeline: **`STOP`**

This prevents the AI from generating fictional framework code merely to satisfy the requirement.

---

### Phase 3 — E2E Playwright Code Generation

When validation clears the scenario, the E2E code generation agent consumes the test case specification and validation output.

It dynamically inspects the existing framework:
`src/pages/adminLoginPage.ts`, `src/pages/adminRoomsPage.ts`, `src/fixtures/UiFixture.ts`, `src/support/locators/`

Suppose the framework contains:
`loginAsAdmin()`, `loginWithInvalidCredentials()`, `verifyLoginFormVisible()`, `verifyInvalidCredentialsErrorVisible()`

The agent maps the abstract test case to those existing capabilities.

The generated output is:
`tests/admin/APP-2.spec.ts`

```typescript
import { test } from "@fixtures/UiFixture";
import { AdminLoginPage } from "@pages/adminLoginPage";
import { AdminRoomsPage } from "@pages/adminRoomsPage";

test.describe("Admin Login & Authentication (APP-2)", () => {
  let adminLoginPage: AdminLoginPage;
  let adminRoomsPage: AdminRoomsPage;

  test.beforeEach(async ({ actions }) => {
    adminLoginPage = new AdminLoginPage(actions);
    adminRoomsPage = new AdminRoomsPage(actions);
  });

  test("Successful Admin Login and Redirect to Rooms Portal @smoke @regression @P1 @APP-2", async () => {
    await adminLoginPage.navigate();
    await adminLoginPage.verifyLoginFormVisible();
    await adminLoginPage.loginAsAdmin();
    await adminRoomsPage.verifyPageLoaded();
    await adminRoomsPage.verifyRoomManagementVisible();
  });
});
```

#### Semantic Assertion Enforcement
The system does not treat compilation as proof that a test is meaningful.

A generated test must actually exercise the behaviour described by its acceptance criterion.

For example, this is insufficient for an invalid-login requirement:
```typescript
await adminLoginPage.navigate();
await adminLoginPage.verifyLoginFormVisible();
```

The negative scenario must actually submit invalid credentials and verify the resulting state:
```typescript
await adminLoginPage.navigate();
await adminLoginPage.verifyLoginFormVisible();
await adminLoginPage.loginWithInvalidCredentials(
  "invalidUser",
  "wrongPassword",
);
await adminLoginPage.verifyInvalidCredentialsErrorVisible();
```

This protects against content-free test generation.

---

### Phase 4 — Quality Check

The quality-check agent validates the generated TypeScript.

It runs:
`npm run type-check`  
and  
`npm run lint`

The quality stage verifies:
* valid TypeScript
* valid imports
* existing Page Object methods
* correct method signatures
* coding standards
* custom ESLint rules
* duplicate test titles
* generated-code consistency

If a correctable issue is found, the agent can enter a repair loop:
`Generate → Type-check → Failure → Analyse error → Repair generated test → Type-check again`

The goal is: **0 TypeScript errors, 0 ESLint errors**.

#### Stale Cache Protection
The repository contains a custom ESLint rule: `src/customEsLintRules/preventDuplicateTitles.mjs`

The implementation includes stale-cache reconciliation so that deleted or renamed tests do not remain permanently registered as duplicates.

This is important because persistent state can otherwise create false failures across independent lint runs.

---

### Phase 5 — Test Execution

Once the generated test passes technical validation, the test executor runs the Playwright test against the real application.

`npx playwright test tests/home/APP-5.spec.ts`

This is different from type-checking.

* Type-checking answers: *Is the generated code structurally valid?*
* Playwright execution answers: *Does the generated test actually work against the application?*

The executor collects runtime results and evidence.

It also performs sanity checks for suspicious results, such as:
* zero-assertion passes
* unexpectedly short execution durations
* validation warnings
* execution inconsistencies

The output is:
`test_artifacts/home/APP-5/phases/e2e_execution_report.md`

#### Example Runtime Result
For APP-5:
`TC-APP-5-001 PASSED` | `TC-APP-5-002 PASSED` | Total: 2, Passed: 2, Failed: 0

The execution stage can also retain Playwright artifacts such as:
* traces
* screenshots
* videos
* execution logs

---

### Phase 6 — Evidence and Report Synthesis

The report-generation agent consolidates the evidence generated by previous stages.

It consumes:
`jira_data.json`, `test_requirements_output.md`, `APP-5_test_cases.md`, `test_coverage_matrix.md`, `e2e_validation_output.md`, `e2e_execution_report.md`

It produces:
`test_artifacts/home/APP-5/final_test_generation_report.md`

The report provides traceability across the entire workflow:
`JIRA Acceptance Criterion → Test Case → Generated Playwright Test → Validation Evidence → Quality Validation → Runtime Execution → Final Status`

#### Strict Status Synthesis
The final report does not simply copy the Playwright exit code.

The system applies Rule R1. The overall status can be:
* **`PASSED`**
* **`PASSED WITH WARNINGS`**
* **`FAILED`**
* **`BLOCKED`**

##### `PASSED`
All required gates are clean (0 validation flags, 0 framework gaps, TSC passed, ESLint passed, Execution passed).

##### `PASSED WITH WARNINGS`
Execution may have passed, but an upstream validation concern requires human review.  
Example: Playwright: PASSED | Validation: AMBIGUOUS -> Final: **`PASSED WITH WARNINGS`**

##### `FAILED`
Runtime or technical validation failed.

##### `BLOCKED`
A required framework capability is unavailable or another hard release condition prevents progression.

#### Example: APP-2 Warning Path
APP-2 demonstrates why the system has multiple independent gates.

Suppose `TC-APP-2-002` (Invalid Admin Credentials) executes successfully:
Playwright: **PASSED**

but the validation agent identifies an ambiguous locator:
Validation: **`AMBIGUOUS — NEEDS HUMAN REVIEW`**

The final report must therefore become **`PASSED WITH WARNINGS`**, not `PASSED`.

The PR submitter then refuses release:
`PASSED WITH WARNINGS → PR GATE → STOP`

This prevents a runtime green result from overriding a known evidence-quality problem.

#### Example: APP-5 Clean Path
APP-5 demonstrates the clean release path:
`APP-5 → 100% AC coverage → 0 framework gaps → Validation clean → Playwright code generated → TSC = 0 errors → ESLint = 0 errors → 2 Playwright tests passed → Final report = PASSED → PR gate = CLEARED`

The PR submitter can then create the feature branch, stage the generated test and artifacts, create the Conventional Commit, and push the branch.

Example:
Branch: `feature/APP-5-e2e-tests`  
Commit: `feat(test): add Playwright E2E tests for APP-5`

The agent does not automatically merge the change into master.

---

### Phase 7 — PR Submission Gate

The PR submitter reads `final_test_generation_report.md` before performing release automation.

* **For `PASSED`**: ALLOW -> Create feature branch -> Stage generated files -> Create commit -> Push branch
* **For `PASSED WITH WARNINGS` / `FAILED` / `BLOCKED`**: Gate holds -> **DO NOT** create release branch, push generated changes, bypass human review, or merge into master.

This creates a clear boundary between AI-generated engineering work and release authorization.

---

### Phase 8 — Master Workflow Orchestrator

The workflow orchestrator coordinates the complete process.

Its responsibility is not to generate tests itself. Its responsibility is to control:
* agent sequencing
* artifact dependencies
* quality gates
* stop conditions
* final workflow status

```text
User
 │
 │ Generate tests for APP-5
 ▼
Workflow Orchestrator
 │
 ├── JIRA Extractor
 ├── Test Case Generator
 ├── E2E Validation
 ├── E2E Code Generator
 ├── Quality Checker
 ├── Test Executor
 ├── Report Generator
 └── PR Submitter
```

The orchestrator therefore acts as the control plane for the QE workflow.

---

## State Machine

The system can be understood as a state machine:

```text
START
  │
  ▼
JIRA REQUIREMENT EXTRACTION
  │
  ▼
TEST CASE SPECIFICATION
  │
  ▼
EXISTING TEST VALIDATION
  │
  ├────────────── Framework Gap ──────────────► STOP
  │
  ▼
CODE GENERATION
  │
  ▼
QUALITY CHECK
  │
  ├── Failure ──► Repair / Stop
  │
  ▼
LIVE EXECUTION
  │
  ├── Failure ──► Report FAILED
  │
  ▼
REPORT SYNTHESIS
  │
  ├── BLOCKED ───────────────► STOP
  ├── PASSED WITH WARNINGS ─► HUMAN REVIEW / STOP
  │
  ▼
PASSED
  │
  ▼
PR SUBMISSION
```

This state-machine approach is important because the workflow does not assume that every stage should always continue.

---

## Why This Architecture Matters

1. **AI cannot simply invent framework capabilities**  
   The code generator must discover existing Page Object and fixture capabilities. If they don't exist: `Framework Gap → STOP`. This is safer than allowing the model to guess.
2. **Compilation is not treated as test correctness**  
   A test can compile and still be semantically useless. Therefore the system separately validates: Semantic correctness + Technical correctness + Runtime correctness.
3. **Runtime green does not automatically mean release green**  
   A test can pass at runtime while an upstream evidence concern remains. Therefore: `Playwright PASS + Validation WARNING → PASSED WITH WARNINGS → PR BLOCKED`. This prevents false greenlights.
4. **Every major decision is traceable**  
   A final report can trace: `AC → Test Case → Spec → Validation Evidence → Execution → Final Status`. This creates an evidence chain rather than relying on an AI-generated summary alone.

---

## Repository Structure

```text
ts-pw-test-assistant/
│
├── config/
│   ├── agents/
│   │   ├── jira_extractor.md
│   │   ├── test_case_generation.md
│   │   ├── e2e_validation_agent.md
│   │   ├── e2e_code_generation_agent.md
│   │   ├── e2e_quality_check_agent.md
│   │   ├── e2e_test_executor_agent.md
│   │   ├── report_generation_agent.md
│   │   ├── pr_submitter_agent.md
│   │   └── workflow_orchestrator.md
│   │
│   └── rules/
│       ├── test_case_rules/
│       │   └── unified_test_generation_rules.md
│       │
│       └── e2e_rules/
│           ├── e2e_test_case_guidelines_ts_pw.yaml
│           ├── e2e_quality_check_rules.yaml
│           ├── e2e_test_executor_rules.yaml
│           └── pr_submitter_rules.yaml
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
│   ├── admin/
│   └── home/
│
└── test_artifacts/
    └── {component}/
        └── {JIRA_KEY}/
            ├── eslint.config.mjs
            ├── package.json
            ├── playwright.config.ts
            ├── README.md
            └── tsconfig.json
```

### Example Artifact Structure
For JIRA issue `APP-5`:

```text
test_artifacts/
└── home/
    └── APP-5/
        ├── phases/
        │   ├── jira_data.json
        │   ├── test_requirements_output.md
        │   ├── e2e_validation_output.md
        │   ├── e2e_execution_report.md
        │   └── pr_submission_report.md
        ├── test_cases/
        │   └── APP-5_test_cases.md
        ├── test_coverage_matrix.md
        └── final_test_generation_report.md
```

Generated automation: `tests/home/APP-5.spec.ts`

---

## Underlying Playwright Framework

The AI workflow is built on top of the existing Playwright + TypeScript automation framework.

The framework provides:
* Playwright browser automation
* Page Object Model
* fixture-based dependency injection
* reusable actions
* wait handling
* assertion utilities
* locators
* logging
* screenshots
* video
* trace artifacts
* HTML reporting
* JSON reporting
* JUnit reporting
* Allure reporting
* database utilities

The intended separation remains:

```text
AI Agents
   │
   ▼
Generated Playwright Tests
   │
   ▼
Page Objects
   │
   ▼
Fixtures / Helpers
   │
   ▼
Playwright
   │
   ▼
Application
```

AI generates and reasons about the automation. The existing framework remains responsible for executing it.

---

## Current Application Under Test

The reference application is **Restful-Booker-Platform**:

* **UI**: `https://automationintesting.online`
* **Admin username**: `admin`
* **Admin password**: `password`

---

## Installation

```bash
git clone https://github.com/rajeshyemul/ts-pw-test-assistant.git
cd ts-pw-test-assistant
npm install
npx playwright install
```

Create a local environment configuration using the project's expected environment variables. Do not commit real credentials or API tokens.

---

## Main Commands

```bash
# Run the complete Playwright suite
npm test

# Run UI tests
npm run test:ui

# Run smoke tests
npm run test:smoke

# Run headed
npm run test:headed

# Debug
npm run test:debug

# Type-check
npm run type-check

# Lint
npm run lint

# Run the standard quality gate
npm run validate

# Format
npm run format

# Generate HTML report
npm run report:html

# Generate Allure report
npm run report:allure
```

---

## Framework Test Example

A normal Playwright test can still be written directly against the framework:

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

The AI-generated tests follow the same framework conventions.

---

## Design Principles

1. **AI should use the framework, not bypass it**: Generated tests should reuse existing Page Objects, fixtures, helpers, and assertions.
2. **Agents should have narrow responsibilities**: Each agent should do one job well:  
   `Requirement → Test Design → Validation → Implementation → Quality → Execution → Reporting → Release`
3. **Artifacts are contracts**: Each stage produces a persistent output consumed by the next stage. This makes the workflow inspectable and auditable.
4. **Evidence beats assumptions**: Agents must support important conclusions with actual repository or execution evidence.
5. **Stop when confidence is insufficient**: The system should not continue simply because an LLM can generate something.  
   Examples:  
   * Missing framework capability → **`STOP`**
   * Ambiguous validation → **`STOP / Human Review`**
   * Technical failure → **`Repair / STOP`**
   * Runtime failure → **`FAILED`**
   * Clean evidence → **`Continue`**
6. **Human approval remains a release boundary**: The system can automate test generation and release preparation, but warning conditions must prevent automatic progression. The PR submitter does not bypass review policies or automatically merge into the main branch.

---

## Verification Status

The current architecture has been verified through master integration scenarios.

| Component | Status |
| :--- | :--- |
| **JIRA Requirement Extractor** | ✅ Implemented & Verified |
| **AI Test Case Generator** | ✅ Implemented & Verified |
| **E2E Test Validator** | ✅ Implemented & Verified |
| **Playwright Code Generator** | ✅ Implemented & Verified |
| **Quality Checker** | ✅ Implemented & Verified |
| **Test Executor & Sanity Auditor** | ✅ Implemented & Verified |
| **Evidence Report Generator** | ✅ Implemented & Verified |
| **DevOps PR Submitter** | ✅ Implemented & Verified |
| **Master Workflow Orchestrator** | ✅ Implemented & Master-Verified |

---

### Master Integration Verification

Two important workflow paths have been verified:

#### Warning Gate Hold — `APP-2`
`APP-2 → Test generation → Validation ambiguity → Execution PASSED → Final status: PASSED WITH WARNINGS → PR Submitter → 🛑 BLOCKED`

This proves that a runtime pass does not override an unresolved validation warning.

#### Clean Clearance — `APP-5`
`APP-5 → 100% AC coverage → 0 validation warnings → 0 framework gaps → Type-check PASSED → ESLint PASSED → Playwright execution PASSED → Final status: PASSED → PR Submitter → feature/APP-5-e2e-tests → Commit + Push`

This proves that a clean workflow can progress through the release gate.

---

## What This Project Demonstrates

The project demonstrates a progression from traditional automation to Agentic QE:

```text
Playwright Automation
        ↓
Automation Framework
        ↓
Framework Architecture
        ↓
AI-Assisted Test Design
        ↓
AI Test Generation
        ↓
Framework-Aware Code Generation
        ↓
AI Quality Validation
        ↓
Autonomous Test Execution
        ↓
Evidence-Based Reporting
        ↓
Release Gating
        ↓
Agentic Quality Engineering
```

The important architectural lesson is:
> **AI provides intelligence, rules provide control, and the existing engineering tools provide execution.**

---

## Future Extension

The current architecture is intentionally frozen at the verified workflow boundary.

A future extension may add:  
`JIRA ↕ Agentic QE Workflow ↕ JIRA`

with capabilities such as:
* JIRA two-way synchronization
* test evidence synchronization
* execution evidence attached back to JIRA
* automated test-status updates
* richer traceability between JIRA and Playwright

These capabilities are intentionally outside the current implementation.

---

## Learning Objective

This repository is designed as a practical learning platform for understanding how an Agentic QE system is designed and implemented.

The progression is:
`Playwright Engineer → Automation Framework Engineer → Framework Architect → AI-Assisted QE → Agentic Test Generation → Agentic QE Architect`

The goal is not simply to generate Playwright code with AI.

The goal is to understand how AI can participate in a controlled QE engineering workflow while maintaining:
* framework integrity
* test traceability
* semantic quality
* runtime evidence
* release safety
* human control

---

## Documentation

* **Framework architecture**: `docs/framework-architecture.md`
* **Agent definitions**: `config/agents/`
* **Agent rules**: `config/rules/`
* **Generated workflow artifacts**: `test_artifacts/`
* **Generated Playwright tests**: `tests/`

---

## Repository

* **GitHub**: [https://github.com/rajeshyemul/ts-pw-test-assistant](https://github.com/rajeshyemul/ts-pw-test-assistant)
* **Author**: **Rajesh Yemul**
