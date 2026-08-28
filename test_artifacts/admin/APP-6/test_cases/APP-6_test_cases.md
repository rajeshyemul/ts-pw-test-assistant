# Test Case Specifications: APP-6

**JIRA Issue:** APP-6  
**Component:** `admin`  
**Feature:** Admin User Password Reset via Security Question  
**Framework Target:** Playwright + TypeScript (`@fixtures/UiFixture`, `@pages/adminLoginPage`)  

---

## Scenario Overview

| Test Case ID | Scenario Title | Priority | Type | Target Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **TC-APP-6-001** | Request Password Reset via Security Answer | `@P1` | E2E Automated | AC1, AC2 |

---

## Test Case Details

### TC-APP-6-001: Request Password Reset via Security Answer

- **Test ID**: `TC-APP-6-001`
- **Tags**: `@regression`, `@P1`, `@APP-6`
- **Target Acceptance Criteria**: AC1, AC2
- **Summary**: Verify admin user can click Forgot Password link, fill security answer, and submit request.
- **Required Framework Capabilities**:
  - `adminLoginPage.clickForgotPasswordLink()`
  - `adminLoginPage.submitSecurityAnswer("admin@hotel.com", "MyFirstPet")`
  - `adminLoginPage.verifyPasswordResetEmailSent()`

