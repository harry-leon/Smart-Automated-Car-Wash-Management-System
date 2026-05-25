# Backend Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build production-oriented backend auth endpoints for registration, OTP send/verify, login, refresh, logout, JWT, RBAC, and default `MEMBER` tier.

**Architecture:** Keep implementation inside the existing `auth` module with thin controllers, service-owned business logic, JPA-backed persistence, and shared JWT/security infrastructure in `shared`. Use H2-backed integration tests to drive behavior first, then implement the minimum code required to satisfy each endpoint contract.

**Tech Stack:** Spring Boot 3.3, Spring Web, Spring Security, Spring Data JPA, PostgreSQL, H2, springdoc-openapi, JUnit 5, MockMvc

---

## File Structure

**Create**

- `autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java`
- `autowash-backend/src/main/java/com/autowash/auth/entity/OtpRecord.java`
- `autowash-backend/src/main/java/com/autowash/auth/entity/RefreshToken.java`
- `autowash-backend/src/main/java/com/autowash/auth/entity/UserRole.java`
- `autowash-backend/src/main/java/com/autowash/auth/entity/UserStatus.java`
- `autowash-backend/src/main/java/com/autowash/auth/entity/LoyaltyTier.java`
- `autowash-backend/src/main/java/com/autowash/auth/entity/OtpPurpose.java`
- `autowash-backend/src/main/java/com/autowash/auth/repository/AuthUserRepository.java`
- `autowash-backend/src/main/java/com/autowash/auth/repository/OtpRecordRepository.java`
- `autowash-backend/src/main/java/com/autowash/auth/repository/RefreshTokenRepository.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/RegisterRequest.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/RegisterResponse.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/SendOtpRequest.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/SendOtpResponse.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/VerifyOtpRequest.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/LoginRequest.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/LoginResponse.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/RefreshTokenRequest.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/RefreshTokenResponse.java`
- `autowash-backend/src/main/java/com/autowash/auth/dto/LogoutRequest.java`
- `autowash-backend/src/main/java/com/autowash/auth/service/AuthService.java`
- `autowash-backend/src/main/java/com/autowash/auth/service/JwtService.java`
- `autowash-backend/src/main/java/com/autowash/auth/service/OtpService.java`
- `autowash-backend/src/main/java/com/autowash/auth/controller/AuthController.java`
- `autowash-backend/src/main/java/com/autowash/shared/security/JwtAuthenticationFilter.java`
- `autowash-backend/src/main/java/com/autowash/shared/security/AuthUserPrincipal.java`
- `autowash-backend/src/main/java/com/autowash/shared/security/AuthUserDetailsService.java`
- `autowash-backend/src/main/java/com/autowash/shared/exception/ApiException.java`
- `autowash-backend/src/main/java/com/autowash/shared/exception/GlobalExceptionHandler.java`
- `autowash-backend/src/main/resources/db/migration/V1__create_auth_tables.sql`
- `autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java`

**Modify**

- `autowash-backend/pom.xml`
- `autowash-backend/src/main/resources/application.yml`
- `autowash-backend/src/test/resources/application-test.yml`
- `autowash-backend/src/main/java/com/autowash/shared/config/SecurityConfig.java`

### Task 1: Auth Schema and Registration

**Files:**

- Create: `autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/entity/AuthUser.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/entity/UserRole.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/entity/UserStatus.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/entity/LoyaltyTier.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/repository/AuthUserRepository.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/RegisterRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/RegisterResponse.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/service/AuthService.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/controller/AuthController.java`
- Create: `autowash-backend/src/main/resources/db/migration/V1__create_auth_tables.sql`
- Modify: `autowash-backend/pom.xml`
- Modify: `autowash-backend/src/main/resources/application.yml`
- Modify: `autowash-backend/src/test/resources/application-test.yml`

- [ ] **Step 1: Write the failing registration tests**

```java
@Test
void registerCreatesPendingCustomerWithDefaultMemberTier() throws Exception {
    mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "fullName": "Nguyen Van A",
                              "phone": "0901234567",
                              "email": "a@example.com",
                              "password": "SecurePass1!",
                              "passwordConfirm": "SecurePass1!"
                            }
                            """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.phone").value("0901234567"))
            .andExpect(jsonPath("$.data.status").value("PENDING"))
            .andExpect(jsonPath("$.data.requiresOtpVerification").value(true));
}

@Test
void registerRejectsDuplicatePhone() throws Exception {
    registerCustomer("0901234567");

    mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "fullName": "Duplicate",
                              "phone": "0901234567",
                              "email": "dup@example.com",
                              "password": "SecurePass1!",
                              "passwordConfirm": "SecurePass1!"
                            }
                            """))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.errorCode").value("DUPLICATE_PHONE"));
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest`
Expected: FAIL because `/api/v1/auth/register` and auth persistence classes do not exist yet

- [ ] **Step 3: Implement the minimal registration slice**

```java
// AuthUser defaults
this.role = UserRole.CUSTOMER;
this.status = UserStatus.PENDING;
this.tier = LoyaltyTier.MEMBER;
this.isNewCustomer = true;
```

```java
@PostMapping("/register")
public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
    RegisterResponse response = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created("Registration successful. Please verify OTP.", response));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest`
Expected: PASS for the registration tests

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/pom.xml autowash-backend/src/main/resources/application.yml autowash-backend/src/test/resources/application-test.yml autowash-backend/src/main/resources/db/migration/V1__create_auth_tables.sql autowash-backend/src/main/java/com/autowash/auth autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java
git commit -m "feat: add auth registration foundation"
```

### Task 2: OTP Send and Verify

**Files:**

- Modify: `autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/entity/OtpPurpose.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/entity/OtpRecord.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/repository/OtpRecordRepository.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/SendOtpRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/SendOtpResponse.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/VerifyOtpRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/LoginResponse.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/service/OtpService.java`
- Modify: `autowash-backend/src/main/java/com/autowash/auth/service/AuthService.java`
- Modify: `autowash-backend/src/main/java/com/autowash/auth/controller/AuthController.java`
- Modify: `autowash-backend/src/main/resources/db/migration/V1__create_auth_tables.sql`

- [ ] **Step 1: Write the failing OTP tests**

```java
@Test
void sendOtpReturnsDevOtpForPendingAccount() throws Exception {
    registerCustomer("0901234567");

    mockMvc.perform(post("/api/v1/auth/otp/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            { "phone": "0901234567" }
                            """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.phone").value("0901234567"))
            .andExpect(jsonPath("$.data.otpExpiresIn").value(300))
            .andExpect(jsonPath("$.data.devOtp").isString());
}

@Test
void verifyOtpActivatesAccountAndReturnsTokens() throws Exception {
    registerCustomer("0901234567");
    String otp = sendOtpAndExtractDevOtp("0901234567");

    mockMvc.perform(post("/api/v1/auth/otp/verify")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "phone": "0901234567",
                              "otp": "%s"
                            }
                            """.formatted(otp)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.data.tier").value("MEMBER"))
            .andExpect(jsonPath("$.data.accessToken").isString())
            .andExpect(jsonPath("$.data.refreshToken").isString());
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest`
Expected: FAIL because OTP endpoints and token issuance are not implemented yet

- [ ] **Step 3: Implement the minimal OTP lifecycle**

```java
OtpRecord otpRecord = otpService.issueOtp(user, OtpPurpose.REGISTRATION);
return new SendOtpResponse(
        user.getPhone(),
        300,
        maskPhone(user.getPhone()),
        "OTP has been sent to your phone",
        otpExposeForDev ? otpRecord.getCode() : null
);
```

```java
user.activate();
String accessToken = jwtService.generateAccessToken(user);
String refreshToken = authService.createRefreshToken(user);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest`
Expected: PASS for the new OTP tests and the earlier registration tests

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/src/main/java/com/autowash/auth autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java autowash-backend/src/main/resources/db/migration/V1__create_auth_tables.sql
git commit -m "feat: add otp verification flow"
```

### Task 3: Login, Refresh, Logout, and JWT Security

**Files:**

- Modify: `autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/entity/RefreshToken.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/repository/RefreshTokenRepository.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/LoginRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/RefreshTokenRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/RefreshTokenResponse.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/dto/LogoutRequest.java`
- Create: `autowash-backend/src/main/java/com/autowash/auth/service/JwtService.java`
- Create: `autowash-backend/src/main/java/com/autowash/shared/security/AuthUserPrincipal.java`
- Create: `autowash-backend/src/main/java/com/autowash/shared/security/AuthUserDetailsService.java`
- Create: `autowash-backend/src/main/java/com/autowash/shared/security/JwtAuthenticationFilter.java`
- Modify: `autowash-backend/src/main/java/com/autowash/shared/config/SecurityConfig.java`
- Modify: `autowash-backend/src/main/java/com/autowash/auth/service/AuthService.java`
- Modify: `autowash-backend/src/main/java/com/autowash/auth/controller/AuthController.java`

- [ ] **Step 1: Write the failing token and login tests**

```java
@Test
void loginReturnsTokensForActiveAccount() throws Exception {
    activateCustomer("0901234567");

    mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "phone": "0901234567",
                              "password": "SecurePass1!",
                              "rememberMe": false
                            }
                            """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").isString())
            .andExpect(jsonPath("$.data.refreshToken").isString());
}

@Test
void refreshReturnsNewAccessToken() throws Exception {
    String refreshToken = activateCustomerAndLogin("0901234567").refreshToken();

    mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            { "refreshToken": "%s" }
                            """.formatted(refreshToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").isString());
}

@Test
void logoutRevokesRefreshToken() throws Exception {
    String refreshToken = activateCustomerAndLogin("0901234567").refreshToken();

    mockMvc.perform(post("/api/v1/auth/logout")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            { "refreshToken": "%s" }
                            """.formatted(refreshToken)))
            .andExpect(status().isOk());

    mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            { "refreshToken": "%s" }
                            """.formatted(refreshToken)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("TOKEN_INVALID"));
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest`
Expected: FAIL because login, refresh, logout, and refresh-token persistence are incomplete

- [ ] **Step 3: Implement JWT and token-backed auth endpoints**

```java
String accessToken = Jwts.builder()
        .subject(user.getId().toString())
        .claim("phone", user.getPhone())
        .claim("role", user.getRole().name())
        .claim("tier", user.getTier().name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(accessTokenTtl)))
        .signWith(signingKey)
        .compact();
```

```java
.authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/v1/health", "/api/v1/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
        .permitAll()
        .anyRequest()
        .authenticated())
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest`
Expected: PASS for login, refresh, logout, and earlier auth tests

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/src/main/java/com/autowash/auth autowash-backend/src/main/java/com/autowash/shared/config/SecurityConfig.java autowash-backend/src/main/java/com/autowash/shared/security autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java
git commit -m "feat: add jwt auth endpoints"
```

### Task 4: Error Shape, RBAC Readiness, and Final Verification

**Files:**

- Create: `autowash-backend/src/main/java/com/autowash/shared/exception/ApiException.java`
- Create: `autowash-backend/src/main/java/com/autowash/shared/exception/GlobalExceptionHandler.java`
- Modify: `autowash-backend/src/main/java/com/autowash/shared/dto/ApiResponse.java`
- Modify: `autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java`

- [ ] **Step 1: Write the failing validation and auth error tests**

```java
@Test
void registerRejectsInvalidPhoneWithValidationErrorShape() throws Exception {
    mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "fullName": "Bad Phone",
                              "phone": "123",
                              "password": "SecurePass1!",
                              "passwordConfirm": "SecurePass1!"
                            }
                            """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errors[0].field").exists());
}

@Test
void loginRejectsPendingAccount() throws Exception {
    registerCustomer("0909999999");

    mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                              "phone": "0909999999",
                              "password": "SecurePass1!",
                              "rememberMe": false
                            }
                            """))
            .andExpect(status().isUnauthorized());
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `.\mvnw.cmd test -Dtest=AuthControllerIntegrationTest`
Expected: FAIL because shared error mapping does not yet match the contract

- [ ] **Step 3: Implement contract-aligned error handling**

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
    List<Map<String, String>> errors = exception.getBindingResult().getFieldErrors().stream()
            .map(error -> Map.of(
                    "field", error.getField(),
                    "message", error.getDefaultMessage(),
                    "code", "INVALID_FORMAT"
            ))
            .toList();

    return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "statusCode", 400,
            "message", "Validation failed",
            "errorCode", "VALIDATION_ERROR",
            "errors", errors,
            "timestamp", Instant.now().toString()
    ));
}
```

- [ ] **Step 4: Run final verification**

Run: `.\mvnw.cmd test`
Expected: PASS with all auth and skeleton tests green

Run: `.\mvnw.cmd spring-boot:run`
Expected: app starts locally and Swagger shows auth endpoints

- [ ] **Step 5: Commit**

```bash
git add autowash-backend/src/main/java/com/autowash/shared/dto/ApiResponse.java autowash-backend/src/main/java/com/autowash/shared/exception autowash-backend/src/test/java/com/autowash/auth/AuthControllerIntegrationTest.java
git commit -m "feat: finalize auth api contract"
```
