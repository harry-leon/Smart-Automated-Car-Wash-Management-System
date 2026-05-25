# Backend User Profile API Design

**Date:** 2026-05-25
**Task:** Implement backend user profile API
**Scope:** Profile read/update; preferences read/update; authenticated current-user response

## Goal

Implement a production-oriented user profile API for `autowash-backend` that lets an authenticated customer fetch and update their own profile and preferences using the existing JWT-based auth flow.

## Constraints

- Stay inside the existing Spring Boot modular-monolith structure.
- Keep scope limited to profile and preferences APIs plus the minimum persistence and shared auth plumbing they require.
- Preserve completed behavior from prior tasks:
  - auth endpoints remain working
  - JWT authentication remains the source of current-user identity
  - health endpoint and Swagger remain available
- Do not add phone re-verification, password changes, avatar upload, loyalty business logic, admin profile management, or cross-module refactors not required by this task.

## Recommended Approach

Use a small `user` module for profile-facing APIs while keeping the source-of-truth user record in the existing `auth_users` table.

Why this approach:

- It avoids duplicating user identity data across modules.
- It keeps profile and preference responsibilities easy to review with thin controllers and service-owned logic.
- It limits schema growth to the exact fields needed for this scope.

## Package Layout

Add a focused `user` module:

- `com.autowash.user.controller`
- `com.autowash.user.dto`
- `com.autowash.user.service`

Reuse existing code where appropriate:

- `com.autowash.auth.entity`
- `com.autowash.auth.repository`
- `com.autowash.shared.config`
- `com.autowash.shared.dto`
- `com.autowash.shared.exception`
- `com.autowash.shared.security`

## Data Model

Extend `auth_users` instead of introducing a second profile table.

New fields:

- `language`
- `theme`
- `notifications_enabled`
- `email_notifications`
- `sms_notifications`

Enums:

- `language`: `VI`, `EN`
- `theme`: `LIGHT`, `DARK`

Defaults for newly created accounts:

- `language = VI`
- `theme = LIGHT`
- `notifications_enabled = true`
- `email_notifications = false`
- `sms_notifications = true`

Reasoning:

- The contract only needs a compact preference set.
- Direct columns are easier to validate and query than a JSON blob.
- This keeps migrations and entity mapping simple while the product is still in mandatory-first scope.

## Authenticated Current User

Current-user resolution must come from the authenticated JWT principal, not from request payload or query params.

Design:

- the JWT filter resolves the authenticated `AuthUser`
- a small service helper resolves the current `AuthUser` by principal user id
- all `/api/v1/users/**` endpoints operate only on that resolved user

This keeps the API safe and avoids any user-id spoofing surface.

## Endpoint Design

### `GET /api/v1/users/profile`

Behavior:

- require Bearer token
- resolve the current authenticated customer
- return profile data aligned with contract:
  - `userId`
  - `fullName`
  - `phone`
  - `email`
  - `status`
  - `role`
  - `tier`
  - `isNewCustomer`
  - `loyaltyBalance`
  - `registeredAt`
  - nested `preferences`

Scope decision:

- `loyaltyBalance` is returned as `0` for now because real loyalty accounting is out of scope, but the response shape stays contract-ready.

### `PUT /api/v1/users/profile`

Behavior:

- require Bearer token
- allow updating only:
  - `fullName`
  - `email`
- do not allow phone updates in this task
- validate:
  - `fullName` required, max 100 chars
  - `email` valid format when present
- return updated profile summary with `updatedAt`

Scope decision:

- `phone` stays read-only for now because changing it safely would pull in OTP re-verification and session edge cases outside current scope.

### `GET /api/v1/users/preferences`

Behavior:

- require Bearer token
- return:
  - `userId`
  - `language`
  - `theme`
  - `notificationsEnabled`
  - `emailNotifications`
  - `smsNotifications`

### `PUT /api/v1/users/preferences`

Behavior:

- require Bearer token
- update:
  - `language`
  - `theme`
  - `notificationsEnabled`
  - `emailNotifications`
  - `smsNotifications`
- validate enum values and required booleans
- return updated preferences plus `updatedAt`

## Validation and Errors

Use the shared validation and exception flow already introduced for auth.

Expected error behavior:

- `401` when token is missing or invalid
- `400` when profile or preferences payload is invalid
- `404` only if the authenticated principal no longer maps to an existing user record

Error responses should continue using the established shape:

- `success`
- `statusCode`
- `message`
- `errorCode`
- `errors` for validation cases
- `timestamp`

## Swagger / OpenAPI

Document all four endpoints with:

- operation summaries
- request DTOs
- response DTOs
- bearer auth requirement

Swagger should clearly show that `/api/v1/users/**` requires JWT authentication.

## Testing Strategy

Use integration tests with the existing auth flow to obtain real JWT tokens before hitting profile endpoints.

Coverage:

- authenticated user can fetch profile
- unauthenticated request gets `401`
- authenticated user can update `fullName` and `email`
- invalid profile update returns validation error shape
- authenticated user can fetch preferences
- authenticated user can update preferences

This keeps the tests close to the real application flow and protects the auth/profile integration seam.

## Out-of-Scope Decisions Locked In

To keep this task stable and easy to review, the following are explicitly deferred:

- updating phone number
- password change endpoints
- forgot-password/profile overlap
- avatar/image upload
- loyalty point calculation
- admin-facing profile management
- notification delivery preferences beyond stored booleans

## Success Criteria

This task is complete when:

- an authenticated customer can fetch current profile
- profile update validates input and persists allowed fields
- preferences read/update work with real persistence
- Swagger documents the endpoints and JWT requirement
- existing auth tests still pass
