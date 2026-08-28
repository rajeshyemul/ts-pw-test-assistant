# JIRA Requirements Extraction Report (LIVE JIRA DATA - APP-5)

**JIRA Key:** APP-5  
**Server:** `https://rajeshyemul.atlassian.net`  
**Component:** `home`  
**Issue Summary:** Public Room Catalog & Availability Verification  
**Issue Type:** Story | **Status:** To Do  
**Extracted At:** 2026-08-28  

---

## 1. Requirements & Acceptance Criteria Analysis (Extracted Live)

### Core User Outcome
As a guest user, I want to view the public room catalog on the home page so that I can see available rooms, nightly prices, and room features.

### Restated Acceptance Criteria (Testable Terms)
- **AC-01 (Catalog Visibility)**: Guest user can navigate to the public home page and view the room catalog section.
- **AC-02 (Populated Room Cards)**: Public room catalog displays populated room cards with titles, nightly prices, and feature lists.

---

## 2. Existing Coverage Verification

**Local Test Scan Results (`tests/` directory):**
- Scanned `tests/example/homePage.test.ts`.
- Gaps identified for `APP-5`: Dedicated test specification and matrix report for `APP-5`.

---

## 3. Automation Framework & Setup Review

- **Target Page Object**: [`HomePage`](file:///Users/rajesh.yemul/ts-pw-test-assistant/src/pages/homePage.ts).
- **Target Locators**: `BookingHomePageLocators`.
- **Available Read-Only Page Methods**:
  - `homePage.navigate()`
  - `homePage.verifyRoomCatalogVisible()`
  - `homePage.verifyRoomCardsArePopulated()`

---

## 4. Execution Summary Markers

- `✅ Step 1 completed: Live JIRA ticket APP-5 fetched from https://rajeshyemul.atlassian.net.`
- `✅ Step 2 completed: Scanned local tests/ for existing home page tests.`
- `✅ Step 3 completed: Reviewed HomePage.ts & UiFixture.ts.`
- `✅ Step 4 completed: Output saved to test_artifacts/home/APP-5/phases/test_requirements_output.md.`

