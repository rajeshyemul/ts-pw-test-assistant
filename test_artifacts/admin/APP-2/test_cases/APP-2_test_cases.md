# Test Case Specifications: APP-2

**JIRA Issue:** APP-2  
**Component:** `admin`  
**Feature:** Admin User Login & Authentication  
**Framework Target:** Playwright + TypeScript (`@fixtures/UiFixture`, `@pages/adminLoginPage`)  

---

## Scenario Overview

| Test Case ID | Scenario Title | Priority | Type | Target Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **TC-APP-2-001** | Successful Admin Login and Redirect to Rooms Portal | `@P1` | E2E Automated | AC1, AC3 |
| **TC-APP-2-002** | Invalid Admin Credentials Error Banner Validation | `@P2` | E2E Automated | AC2 |

---

## Test Case Details

### TC-APP-2-001: Successful Admin Login and Redirect to Rooms Portal

- **Test ID**: `TC-APP-2-001`
- **Tags**: `@smoke`, `@regression`, `@P1`, `@APP-2`
- **Target Acceptance Criteria**: AC1, AC3
- **Summary**: Verify that an administrator can navigate to the admin portal, enter valid credentials (`admin` / `password`), and be successfully redirected to the `/admin/#/rooms` management page.
- **Discovered Framework Capabilities**:
  - Fixtures: `import { test } from "@fixtures/UiFixture";`
  - Page Objects: `AdminLoginPage` (`@pages/adminLoginPage`), `AdminRoomsPage` (`@pages/adminRoomsPage`)
  - Page Methods: `adminLoginPage.navigate()`, `adminLoginPage.verifyLoginFormVisible()`, `adminLoginPage.loginAsAdmin()`, `adminRoomsPage.verifyPageLoaded()`

#### Test Execution Steps:
1. **Preconditions**:
   - Environment is available (`ApplicationUrls.ADMIN`).
   - Admin credentials configured in `.env` (`ADMIN_USERNAME=admin`, `ADMIN_PASSWORD=password`).
2. **Setup**:
   - Initialize `adminLoginPage = new AdminLoginPage(actions);`
   - Initialize `adminRoomsPage = new AdminRoomsPage(actions);`
3. **Step 1**: Navigate to admin login page.
   - *Action*: `await adminLoginPage.navigate();`
   - *Expected Outcome*: Page loads and login heading/inputs are visible (`await adminLoginPage.verifyLoginFormVisible();`).
4. **Step 2**: Authenticate using valid admin credentials.
   - *Action*: `await adminLoginPage.loginAsAdmin();`
   - *Expected Outcome*: Form submits credentials and waits for navigation to `/admin/#/rooms`.
5. **Step 3**: Verify redirection and room management portal readiness.
   - *Action*: `await adminRoomsPage.verifyPageLoaded();`
   - *Expected Outcome*: Room management portal opens and inventory controls are visible.

---

### TC-APP-2-002: Invalid Admin Credentials Error Banner Validation

- **Test ID**: `TC-APP-2-002`
- **Tags**: `@regression`, `@P2`, `@APP-2`
- **Target Acceptance Criteria**: AC2
- **Summary**: Verify that attempting to log in with invalid credentials (e.g. `invalidUser` / `wrongPassword`) displays an error banner containing `"Invalid credentials"`.
- **Discovered Framework Capabilities**:
  - Fixtures: `import { test } from "@fixtures/UiFixture";`
  - Page Objects: `AdminLoginPage` (`@pages/adminLoginPage`)
  - Page Methods: `adminLoginPage.navigate()`, `adminLoginPage.verifyLoginFormVisible()`, `adminLoginPage.loginWithInvalidCredentials("invalidUser", "wrongPassword")`, `adminLoginPage.verifyInvalidCredentialsErrorVisible()`.

#### Test Execution Steps:
1. **Preconditions**:
   - Environment is available (`ApplicationUrls.ADMIN`).
2. **Setup**:
   - Initialize `adminLoginPage = new AdminLoginPage(actions);`
3. **Step 1**: Navigate to admin login page.
   - *Action*: `await adminLoginPage.navigate();`
   - *Expected Outcome*: Login form is displayed.
4. **Step 2**: Enter invalid credentials and click login.
   - *Action*: `await adminLoginPage.loginWithInvalidCredentials("invalidUser", "wrongPassword");`
   - *Expected Outcome*: System attempts login, does not navigate away, and submits request.
5. **Step 3**: Assert error banner presence.
   - *Action*: `await adminLoginPage.verifyInvalidCredentialsErrorVisible();`
   - *Expected Outcome*: Error banner is visible and contains expected text `"Invalid credentials"`.

---

## STOP Boundary Confirmation
- Specifications generated in Markdown format.
- Code generation (`.spec.ts`), execution, type-checking, and linting belong to Step 3.

