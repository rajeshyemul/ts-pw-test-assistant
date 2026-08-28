# Test Case Specifications: APP-5

**JIRA Issue:** APP-5  
**Component:** `home`  
**Feature:** Public Room Catalog & Availability Verification  
**Framework Target:** Playwright + TypeScript (`@fixtures/UiFixture`, `@pages/homePage`)  

---

## Scenario Overview

| Test Case ID | Scenario Title | Priority | Type | Target Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **TC-APP-5-001** | Verify Public Room Catalog Visibility on Home Page | `@P1` | E2E Automated | AC1 |
| **TC-APP-5-002** | Verify Populated Room Cards with Prices and Features | `@P2` | E2E Automated | AC2 |

---

## Test Case Details

### TC-APP-5-001: Verify Public Room Catalog Visibility on Home Page

- **Test ID**: `TC-APP-5-001`
- **Tags**: `@smoke`, `@regression`, `@P1`, `@APP-5`
- **Target Acceptance Criteria**: AC1
- **Summary**: Verify that a guest user can navigate to the public home page and that the room catalog section is displayed with availability controls.
- **Discovered Framework Capabilities**:
  - Fixtures: `import { test } from "@fixtures/UiFixture";`
  - Page Objects: `HomePage` (`@pages/homePage`)
  - Page Methods: `homePage.navigate()`, `homePage.verifyRoomCatalogVisible()`

#### Test Execution Steps:
1. **Preconditions**: Environment is available (`ApplicationUrls.HOME`).
2. **Setup**: Initialize `homePage = new HomePage(actions);`
3. **Step 1**: Navigate to public home page.
   - *Action*: `await homePage.navigate();`
   - *Expected Outcome*: Home page loads successfully.
4. **Step 2**: Verify room catalog section visibility.
   - *Action*: `await homePage.verifyRoomCatalogVisible();`
   - *Expected Outcome*: Room catalog section and room card titles are visible.

---

### TC-APP-5-002: Verify Populated Room Cards with Prices and Features

- **Test ID**: `TC-APP-5-002`
- **Tags**: `@regression`, `@P2`, `@APP-5`
- **Target Acceptance Criteria**: AC2
- **Summary**: Verify that public room cards display complete information including room titles, descriptions, nightly prices, and feature lists.
- **Discovered Framework Capabilities**:
  - Fixtures: `import { test } from "@fixtures/UiFixture";`
  - Page Objects: `HomePage` (`@pages/homePage`)
  - Page Methods: `homePage.navigate()`, `homePage.verifyRoomCardsArePopulated()`

#### Test Execution Steps:
1. **Preconditions**: Environment is available (`ApplicationUrls.HOME`).
2. **Setup**: Initialize `homePage = new HomePage(actions);`
3. **Step 1**: Navigate to public home page.
   - *Action*: `await homePage.navigate();`
   - *Expected Outcome*: Home page loads successfully.
4. **Step 2**: Assert room cards are populated with prices and features.
   - *Action*: `await homePage.verifyRoomCardsArePopulated();`
   - *Expected Outcome*: Room cards contain valid titles, non-empty descriptions, nightly prices, and features.

---

## STOP Boundary Confirmation
- Specifications generated in Markdown format.
- Code generation (`.spec.ts`), execution, type-checking, and linting belong to Step 3.

