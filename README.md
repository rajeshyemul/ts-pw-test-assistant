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

The current implementation provides a complete, 5-phase multi-agent test-generation and validation pipeline:

```text
JIRA Ticket
    │
    ▼
Step 1: JIRA Requirement Extraction Agent (jira_extractor)
    │
    ├── jira_data.json
    └── test_requirements_output.md
    │
    ▼
Step 2: Test Case Generation Agent (test_case_generation)
    │
    ├── Test Case Specification ({jira_issue_key}_test_cases.md)
    └── Test Coverage Matrix (test_coverage_matrix.md)
    │
    ▼
Step 3.1: E2E Validation Agent (e2e_validation_agent)
    │
    ├── Multi-Signal Search across tests/
    ├── Rule V1 Line-Level Assertion Evidence Citations
    └── Rule V2 Subtlety Audit (AMBIGUOUS flag for broad locators)
    │
    ▼
Step 3.2: E2E Code Generation Agent (e2e_code_generation_agent)
    │
    ├── Step 0 Validation Coverage Gate (Skips COVERED, Halts AMBIGUOUS)
    ├── Rule 9 Framework Gap Contract (Halts & emits framework_gap_report.md if Page Objects lack methods)
    └── Generates Playwright TypeScript (.spec.ts)
    │
    ▼
Step 3.3: E2E Quality Check Agent (e2e_quality_check_agent)
    │
    ├── TypeScript Strict Validation (tsc --noEmit)
    └── Custom ESLint Rule Validation (eslint . --ext .ts)
    │
    ▼
Step 3.4: E2E Test Executor Agent (e2e_test_executor_agent)
    │
    ├── Headless Live Execution against Target App
    ├── Step 0 Validation Flag Cross-Check (Downgrades verdict for AMBIGUOUS flags)
    └── Anti-False-Positive Sanity Audit (Assertions > 0, Duration > 50ms, Negative Step Logs)
    │
    ▼
Step 4: Report Generation Agent (report_generation_agent)
    │
    └── Rule R1 Strict Status Synthesis (Escalates warnings to PASSED WITH WARNINGS)
    │
    ▼
Step 5: PR Submitter Agent (pr_submitter_agent)
    │
    └── DevOps Gate Hold (Refuses PR submission if status is BLOCKED, FAILED, or HAS WARNINGS)
```

---

# Current Implemented Capabilities

## 1. JIRA Requirement Extraction (`jira_extractor`)

The workflow retrieves JIRA issues directly via Atlassian JIRA Cloud REST API and produces structured requirement payloads.

Example artifact structure:

```text
test_artifacts/
└── admin/
    └── APP-2/
        └── phases/
            ├── jira_data.json
            └── test_requirements_output.md
```

Extracted data includes:
* JIRA issue key, summary, issue type, priority, and status
* Description and Acceptance Criteria (AC1, AC2, AC3)
* Affected components and target Page Objects

---

## 2. AI Test Case Generation (`test_case_generation`)

Converts requirement analysis into structured test cases and a traceability coverage matrix.

Output:

```text
test_artifacts/
└── admin/
    └── APP-2/
        ├── test_cases/
        │   └── APP-2_test_cases.md
        └── test_coverage_matrix.md
```

Follows four-phase thinking:
1. **Ecosystem Contextualization**
2. **User Reality**
3. **System Integration**
4. **Value Delivery**

---

## 3. E2E Test Validation & Subtlety Audit (`e2e_validation_agent`)

Performs multi-signal search across `tests/` and classifies scenario coverage into `COVERED`, `PARTIALLY_COVERED`, `NOT_COVERED`, or `AMBIGUOUS`.

Key Contracts:
* **Rule V1 (Evidence Citation)**: Every classification MUST cite exact `{file}:{line}` for both matched test and assertion evaluated. Uncited classifications are downgraded to `NOT_COVERED`.
* **Rule V2 (Subtlety Audit)**: Broad or composite locators lacking explicit text assertions are marked `AMBIGUOUS — NEEDS HUMAN REVIEW` rather than being silently greenlit.

---

## 4. Framework-Aware Code Generation & Gap Detection (`e2e_code_generation_agent`)

Transforms cleared specifications into production-ready Playwright TypeScript specs (`tests/{component}/{jira_issue_key}.spec.ts`).

Key Contracts:
* **Step 0 Coverage Gate**: Requires `e2e_validation_output.md` before generating code. Skips `COVERED` scenarios; halts for `AMBIGUOUS` scenarios.
* **Rule 9 (Framework Gap Contract)**: If Page Objects in `src/pages/` lack required methods/locators, code generation **HALTS IMMEDIATELY** and emits `framework_gap_report.md` detailing missing methods instead of guessing selectors.

---

## 5. Automated Quality Check (`e2e_quality_check_agent`)

Verifies generated Playwright code against repository quality standards:

```bash
npm run type-check   # 0 TypeScript compilation errors
npm run lint         # 0 ESLint errors (including custom rules)
```

---

## 6. Live Test Execution & Anti-False-Positive Audit (`e2e_test_executor_agent`)

Executes generated Playwright specs against live environments (`HEADLESS=true npx playwright test ...`).

Key Contracts:
* **Step 0 Cross-Check**: Reads `e2e_validation_output.md` and downgrades verdict if `AMBIGUOUS` flags exist.
* **Sanity Audit**: Verifies assertion counts (>0), test duration (>50ms), and negative step execution logs to eliminate false-positive passes.

---

## 7. Evidence-Based Report Synthesis (`report_generation_agent`)

Aggregates all phase artifacts into `final_test_generation_report.md`.

Key Contract:
* **Rule R1 (Strict Status Synthesis)**: If any upstream scenario is flagged `AMBIGUOUS` or `PARTIALLY_COVERED`, overall status is **DOWNGRADED TO `PASSED WITH WARNINGS`**, and explicit human review action items are generated.

---

## 8. PR Submission & Release Automation (`pr_submitter_agent`)

Automates git feature branch creation (`feature/{jira_issue_key}-e2e-tests`), Conventional Commit formatting, and remote push.

Key Contract:
* **DevOps Gate Hold**: Refuses execution if report status is `BLOCKED`, `FAILED`, or `PASSED_WITH_WARNINGS` with pending human action items.

---

# Underlying Playwright Framework

The AI layer operates on top of the existing Playwright + TypeScript framework architecture:

```text
                 AI MULTI-AGENT PIPELINE
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

---

# Repository Agent Directory

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
│       ├── jira_extraction_rules.yaml
│       ├── workflow_orchestrator.yaml
│       ├── test_case_rules/
│       │   └── unified_test_generation_rules.yaml
│       │
│       └── e2e_rules/
│           ├── e2e_validation_rules.yaml
│           ├── e2e_test_case_guidelines_ts_pw.yaml
│           ├── e2e_quality_check_rules.yaml
│           ├── e2e_test_executor_rules.yaml
│           ├── report_generation_rules.yaml
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
    ├── admin/
    │   ├── APP-2/
    │   └── APP-6/
    └── home/
        ├── APP-5/
        └── HOME-2/
```

---

# Main Framework Commands

```bash
# Run regular Playwright tests
npm test

# Run smoke test suite
npm run test:smoke

# Run TypeScript type check
npm run type-check

# Run ESLint custom rules check
npm run lint

# Run full repository validation
npm run validate
```

---

# Implemented Multi-Agent Roadmap

```text
JIRA Requirement Extraction Agent (jira_extractor.md)
        ↓
Test Case Generation Agent (test_case_generation.md)
        ↓
E2E Test Validation Agent (e2e_validation_agent.md -- Rule V1 & Rule V2)
        ↓
E2E Code Generation Agent (e2e_code_generation_agent.md -- Step 0 Gate & Rule 9)
        ↓
E2E Quality Check Agent (e2e_quality_check_agent.md -- TSC & ESLint)
        ↓
E2E Test Executor Agent (e2e_test_executor_agent.md -- Sanity Audit & Cross-Check)
        ↓
Report Generation Agent (report_generation_agent.md -- Rule R1 Synthesis)
        ↓
PR Submitter Agent (pr_submitter_agent.md -- DevOps Gate)
        ↓
Master Workflow Orchestrator (workflow_orchestrator.md)
```

---

# Documentation

* Framework Architecture Handbook: `docs/framework-architecture.md`
* Agent Specifications: `config/agents/`
* Rules Configurations: `config/rules/`

---

# Repository

GitHub: [rajeshyemul/ts-pw-test-assistant](https://github.com/rajeshyemul/ts-pw-test-assistant)  
Author: **Rajesh Yemul**
