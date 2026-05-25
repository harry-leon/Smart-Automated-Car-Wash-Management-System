# Backend Auth Module Design

**Date:** 2026-05-25
**Task:** Implement backend auth module endpoints
**Scope:** Register; OTP send/verify; login; refresh; logout; JWT; RBAC; default MEMBER tier

## Goal

Implement a production-oriented auth module for `autowash-backend` that persists auth state in PostgreSQL, exposes contract-aligned endpoints under `/api/v1/auth`, and supports customer registration and login flows with JWT and refresh-token based session management.

## Constraints

- Stay inside the existing Spring Boot modular-monolith structure.
- Keep scope limited to the auth module and the minimum shared infrastructure it needs.
- Preserve the completed backend skeleton behavior:
  - `GET /api/v1/health` remains public
  - Swagger/OpenAPI remains available
- Do not implement unrelated user, vehicle, booking, or admin business flows.
- Support real persistence now; do not use in-memory auth state.

## Recommended Approach

Use a single `auth` module with real PostgreSQL-backed persistence for auth accounts, OTP records, and refresh tokens.

Why this approach:

- It matches the current project phase where the team is moving from prototype/demo to a real backend.
- It keeps the implementation reviewable by limiting the first production auth slice to one module.
- It fully supports the required endpoints and their lifecycle without requiring cross-module refactors.

## Package Layout

Keep the current package shape and replace `.gitkeep` placeholders in `auth` with actual code:

- `com.autowash.auth.controller`
- `com.autowash.auth.dto`
- `com.autowash.auth.entity`
- `com.autowash.auth.repository`
- `com.autowash.auth.service`

Shared support code may be added only where necessary:

- `com.autowash.shared.config`
- `com.autowash.shared.dto`
- `com.autowash.shared.exception`
- `com.autowash.shared.security`
- `com.autowash.shared.validation`

## Data Model

### `auth_users`

Stores the authentication-facing account record for now.

Fields:

- `id`
- `full_name`
- `phone`
- `email`
- `password_hash`
- `role`
- `status`
- `tier`
- `is_new_customer`
- `created_at`
- `updated_at`

Rules:

- `phone` is unique
- `email` is nullable
- new account defaults:
  - `role = CUSTOMER`
  - `status = PENDING`
  - `tier = MEMBER`
  - `is_new_customer = true`

### `otp_records`

Stores OTP issuance and verification state.

Fields:

- `id`
- `user_id`
- `purpose`
- `code`
- `expires_at`
- `attempts`
- `verified`
- `created_at`

Rules:

- OTP code is 6 digits
- OTP expires after 5 minutes
- max 3 failed attempts
- only the newest unverified OTP for the same purpose should be accepted

### `refresh_tokens`

Stores refresh tokens for explicit revocation and logout.

Fields:

- `id`
- `user_id`
- `token`
- `expires_at`
- `revoked_at`
- `created_at`

Rules:

- refresh token expires after 30 days
- revoked token cannot be used again

## Endpoint Design

### `POST /api/v1/auth/register`

Behavior:

- validate request fields
- reject duplicate phone
- hash password with BCrypt
- create user in `PENDING`
- assign default `MEMBER` tier
- return registration response aligned with contract

### `POST /api/v1/auth/otp/send`

Behavior:

- find pending account by phone
- create a fresh OTP record
- mark previous outstanding OTPs for the same purpose as not usable by selection logic
- in dev mode, expose the generated OTP in the response or log it for testing

Environment decision:

- use a config flag like `autowash.auth.otp.expose-for-dev=true`
- this behavior is for local/dev only

### `POST /api/v1/auth/otp/verify`

Behavior:

- validate phone and OTP shape
- load latest matching unverified OTP
- reject expired or exhausted OTP
- increment failed attempts on mismatch
- on success:
  - mark OTP verified
  - set user status to `ACTIVE`
  - issue access token
  - issue refresh token

### `POST /api/v1/auth/login`

Behavior:

- authenticate by phone and password
- reject non-`ACTIVE` accounts
- return user identity plus access and refresh tokens

### `POST /api/v1/auth/refresh`

Behavior:

- validate refresh token against DB
- reject expired or revoked token
- issue a new access token
- optionally rotate refresh token if needed; for this scope, reuse existing refresh token unless rotation clearly simplifies security

Recommendation:

- keep refresh implementation simple:
  - issue new access token
  - keep current valid refresh token
- this is enough for scope and avoids extra token churn

### `POST /api/v1/auth/logout`

Behavior:

- accept refresh token
- mark matching DB token as revoked
- return success response

## JWT and RBAC

### JWT

Access token payload should include:

- `sub`
- `phone`
- `role`
- `tier`
- `status`
- `iat`
- `exp`

Config:

- access token expiry: 1 hour
- refresh token expiry: 30 days
- secret configured via application properties/env

### Security

Security configuration should:

- keep public:
  - `/api/v1/health`
  - `/api/v1/auth/**`
  - `/v3/api-docs/**`
  - `/swagger-ui/**`
  - `/swagger-ui.html`
- authenticate all other endpoints
- install a JWT filter that resolves the authenticated principal from bearer tokens
- enable method security for future `@PreAuthorize` usage

### Roles

Auth scope only needs to guarantee:

- registered users are `CUSTOMER`
- JWT principal carries `CUSTOMER`, `STAFF`, or `ADMIN`
- downstream modules can rely on RBAC infrastructure once they are implemented

## Validation and Error Handling

Validation rules to enforce now:

- phone: `^0[0-9]{9}$`
- password:
  - minimum 8 chars
  - at least 1 uppercase
  - at least 1 lowercase
  - at least 1 digit
  - at least 1 special character
- otp: `^[0-9]{6}$`
- email: valid format when present

Error handling should stay aligned with the documented response envelope and use specific error codes such as:

- `VALIDATION_ERROR`
- `DUPLICATE_PHONE`
- `INVALID_CREDENTIALS`
- `TOKEN_INVALID`
- `TOKEN_EXPIRED`
- `ACCOUNT_BLOCKED`
- `ACCOUNT_SUSPENDED`
- `INVALID_OTP`
- `OTP_EXPIRED`
- `RATE_LIMIT_EXCEEDED`

## OpenAPI

Swagger must document:

- request DTOs
- success responses
- relevant error responses
- auth tags and summaries

The auth endpoints should be visible immediately in Swagger UI and usable for local manual verification.

## Testing Strategy

### Automated

Add integration-focused tests covering:

- register success
- register duplicate phone
- OTP send success
- OTP verify success activates account and returns tokens
- login success
- login rejects pending account
- refresh success
- logout revokes token

Use H2 test configuration for repeatable automated tests.

### Manual verification

Manual checklist for submit:

1. run backend tests
2. start app locally
3. register a customer in Swagger
4. send OTP and capture dev OTP
5. verify OTP and confirm account becomes `ACTIVE`
6. login successfully
7. refresh access token successfully
8. logout and confirm revoked refresh token fails afterward

## Scope Guardrails

This task will not implement:

- forgot-password endpoints
- admin/staff account creation flows
- cross-module customer profile APIs
- SMS provider integration
- email provider integration
- frontend integration changes

## Implementation Notes

- Prefer Flyway migrations for new tables instead of Hibernate DDL generation.
- Keep auth business logic in services; controllers should stay thin.
- Use DTOs to isolate API contract from entity classes.
- Keep production behavior deterministic and explicit; avoid hidden dev-only shortcuts except the OTP exposure flag.
