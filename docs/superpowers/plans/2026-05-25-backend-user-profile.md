# Backend User Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build authenticated profile and preferences APIs that read and update the current customer using the existing JWT auth flow.

**Architecture:** Add a small `user` module with thin controllers and a `UserProfileService`, while extending `auth_users` to store preference fields directly. Reuse the existing JWT principal and auth repository so current-user resolution stays centralized and production-safe.

**Tech Stack:** Spring Boot 3.3, Spring Web, Spring Security, Spring Data JPA, PostgreSQL, Flyway, springdoc-openapi, JUnit 5, MockMvc

---

## File Structure

**Create**

- `autowash-backend/src/main/java/com/autowash/user/controller/UserProfileController.java`
- `autowash-backend/src/main/java/com/autowash/user/dto/UserPreferencesDto.java`
- `autowash-backend/src/main/java/com/autowash/user/dto/UserProfileResponse.java`
- `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserProfileRequest.java`
- `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserProfileResponse.java`
- `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserPreferencesRequest.java`
- `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserPreferencesResponse.java`
- `autowash-backend/src/main/java/com/autowash/user/entity/LanguagePreference.java`
- `autowash-backend/src/main/java/com/autowash/user/entity/ThemePreference.java`
- `autowash-backend/src/main/java/com/autowash/user/service/CurrentUserService.java`
- `autowash-backend/src/main/java/com/autowash/user/service/UserProfileService.java`
- `autowash-backend/src/main/resources/db/migration/V2__add_user_preferences_to_auth_users.sql`
- `autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java`

**Modify**

- `autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java`
- `autowash-backend/src/main/java/com/autowash/shared/config/OpenApiConfig.java`
- `autowash-backend/src/test/resources/application-test.yml`
- `autowash-backend/pom.xml` (only if an additional dependency becomes truly necessary)

### Task 1: Current User Read Model and Schema

**Files:**

- Create: `autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/entity/LanguagePreference.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/entity/ThemePreference.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/dto/UserPreferencesDto.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/dto/UserProfileResponse.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/service/CurrentUserService.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/service/UserProfileService.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/controller/UserProfileController.java`
- Create: `autowash-backend/src/main/resources/db/migration/V2__add_user_preferences_to_auth_users.sql`
- Modify: `autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java`

- [ ] **Step 1: Write the failing profile-read tests**

```java
@Test
void getProfileReturnsAuthenticatedCustomerProfile() throws Exception {
    String accessToken = registerActivateAndLogin("0901234580");

    mockMvc.perform(get("/api/v1/users/profile")
                    .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.phone").value("0901234580"))
            .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.data.tier").value("MEMBER"))
            .andExpect(jsonPath("$.data.loyaltyBalance").value(0))
            .andExpect(jsonPath("$.data.preferences.language").value("VI"))
            .andExpect(jsonPath("$.data.preferences.theme").value("LIGHT"));
}

@Test
void getProfileRejectsUnauthenticatedRequest() throws Exception {
    mockMvc.perform(get("/api/v1/users/profile"))
            .andExpect(status().isUnauthorized());
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\mvnw.cmd test -Dtest=UserProfileControllerIntegrationTest`
Expected: FAIL because `/api/v1/users/profile` and preference fields do not exist yet

- [ ] **Step 3: Write the minimal schema and read implementation**

```sql
ALTER TABLE auth_users
    ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'VI',
    ADD COLUMN theme VARCHAR(20) NOT NULL DEFAULT 'LIGHT',
    ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN sms_notifications BOOLEAN NOT NULL DEFAULT TRUE;
```

```java
// Intentionally fixed at 0 for mandatory-first scope until loyalty accounting is implemented.
private static final int TEMPORARY_LOYALTY_BALANCE = 0;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\mvnw.cmd test -Dtest=UserProfileControllerIntegrationTest`
Expected: PASS for the two profile-read tests

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java autowash-backend/src/main/java/com/autowash/user autowash-backend/src/main/resources/db/migration/V2__add_user_preferences_to_auth_users.sql autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java
git commit -m "feat: add current user profile read api"
```

### Task 2: Profile Update API

**Files:**

- Modify: `autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserProfileRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserProfileResponse.java`
- Modify: `autowash-backend/src/main/java/com/autowash/user/service/UserProfileService.java`
- Modify: `autowash-backend/src/main/java/com/autowash/user/controller/UserProfileController.java`
- Modify: `autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java`

- [ ] **Step 1: Write the failing profile-update tests**

```java
@Test
void updateProfileUpdatesFullNameAndEmail() throws Exception {
    String accessToken = registerActivateAndLogin("0901234581");

    mockMvc.perform(put("/api/v1/users/profile")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "fullName": "Nguyen Van Updated",
                              "email": "updated@example.com"
                            }
                            """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.fullName").value("Nguyen Van Updated"))
            .andExpect(jsonPath("$.data.email").value("updated@example.com"));
}

@Test
void updateProfileRejectsInvalidEmail() throws Exception {
    String accessToken = registerActivateAndLogin("0901234582");

    mockMvc.perform(put("/api/v1/users/profile")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "fullName": "Nguyen Van Updated",
                              "email": "not-an-email"
                            }
                            """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\mvnw.cmd test -Dtest=UserProfileControllerIntegrationTest`
Expected: FAIL because profile update DTOs and endpoint do not exist yet

- [ ] **Step 3: Write the minimal profile-update implementation**

```java
public void updateProfile(String fullName, String email) {
    this.fullName = fullName;
    this.email = email;
    this.updatedAt = Instant.now();
}
```

```java
@PutMapping("/profile")
public ApiResponse<UpdateUserProfileResponse> updateProfile(
        @Valid @RequestBody UpdateUserProfileRequest request
) {
    return ApiResponse.ok("Profile updated successfully", userProfileService.updateProfile(request));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\mvnw.cmd test -Dtest=UserProfileControllerIntegrationTest`
Expected: PASS for profile-update tests and earlier read tests

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java autowash-backend/src/main/java/com/autowash/user autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java
git commit -m "feat: add user profile update api"
```

### Task 3: Preferences Read and Update APIs

**Files:**

- Modify: `autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserPreferencesRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/user/dto/UpdateUserPreferencesResponse.java`
- Modify: `autowash-backend/src/main/java/com/autowash/user/service/UserProfileService.java`
- Modify: `autowash-backend/src/main/java/com/autowash/user/controller/UserProfileController.java`
- Modify: `autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java`

- [ ] **Step 1: Write the failing preferences tests**

```java
@Test
void getPreferencesReturnsCurrentUserPreferences() throws Exception {
    String accessToken = registerActivateAndLogin("0901234583");

    mockMvc.perform(get("/api/v1/users/preferences")
                    .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.language").value("VI"))
            .andExpect(jsonPath("$.data.theme").value("LIGHT"))
            .andExpect(jsonPath("$.data.notificationsEnabled").value(true));
}

@Test
void updatePreferencesPersistsNewValues() throws Exception {
    String accessToken = registerActivateAndLogin("0901234584");

    mockMvc.perform(put("/api/v1/users/preferences")
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "language": "EN",
                              "theme": "DARK",
                              "notificationsEnabled": true,
                              "emailNotifications": true,
                              "smsNotifications": false
                            }
                            """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.language").value("EN"))
            .andExpect(jsonPath("$.data.theme").value("DARK"))
            .andExpect(jsonPath("$.data.smsNotifications").value(false));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.\mvnw.cmd test -Dtest=UserProfileControllerIntegrationTest`
Expected: FAIL because preferences endpoints and DTOs do not exist yet

- [ ] **Step 3: Write the minimal preferences implementation**

```java
public void updatePreferences(
        LanguagePreference language,
        ThemePreference theme,
        boolean notificationsEnabled,
        boolean emailNotifications,
        boolean smsNotifications
) {
    this.language = language;
    this.theme = theme;
    this.notificationsEnabled = notificationsEnabled;
    this.emailNotifications = emailNotifications;
    this.smsNotifications = smsNotifications;
    this.updatedAt = Instant.now();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.\mvnw.cmd test -Dtest=UserProfileControllerIntegrationTest`
Expected: PASS for preferences tests and earlier profile tests

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java autowash-backend/src/main/java/com/autowash/user autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java
git commit -m "feat: add user preferences apis"
```

### Task 4: Swagger, Full Verification, and Runtime Sanity Check

**Files:**

- Modify: `autowash-backend/src/main/java/com/autowash/shared/config/OpenApiConfig.java`
- Modify: `autowash-backend/src/main/java/com/autowash/user/controller/UserProfileController.java`
- Modify: `autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java` (only if one final auth/validation assertion is missing)

- [ ] **Step 1: Add the last failing documentation/security test if needed**

```java
@Test
void getProfileRequiresValidBearerToken() throws Exception {
    mockMvc.perform(get("/api/v1/users/profile")
                    .header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized());
}
```

- [ ] **Step 2: Run test to verify it fails only if coverage is missing**

Run: `.\mvnw.cmd test -Dtest=UserProfileControllerIntegrationTest`
Expected: Either existing green coverage is already sufficient, or this new case fails until security flow is complete

- [ ] **Step 3: Finish Swagger annotations and endpoint summaries**

```java
@Tag(name = "User Profile")
@Operation(summary = "Get authenticated user's profile")
```

- [ ] **Step 4: Run final verification**

Run: `.\mvnw.cmd test`
Expected: PASS with auth, profile, and skeleton tests green

Run: `.\mvnw.cmd package -DskipTests`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/src/main/java/com/autowash/user autowash-backend/src/main/java/com/autowash/shared/config/OpenApiConfig.java autowash-backend/src/test/java/com/autowash/user/UserProfileControllerIntegrationTest.java
git commit -m "feat: finalize user profile api"
```
