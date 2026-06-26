# CLAUDE.md

## Purpose

This file guides AI coding tools such as Claude Code, Codex, Cursor, or similar agents when working in this repository.

The repository is the **Smart Automated Car Wash Management System**. AI tools must preserve the current project structure, avoid generic rewrites, and make small, reviewable changes that match the existing codebase.

Before coding, inspect the relevant files. During coding, preserve the current architecture. After coding, validate honestly.

---

## Mandatory Startup Rule

At the start of a new chat session, the AI tool must:

1. Read this root `CLAUDE.md`.
2. Inspect the current repository structure once with non-mutating read/search commands.
3. Reuse that structure for the rest of the session.
4. Avoid repeatedly scanning the full repo unless the structure changed or a path is missing.

Only ask the user for information that cannot be inferred from the repository or the current conversation.

---

## Current Project Stack

Only use stack choices already present in the project files.

### Frontend

- Folder: `autowash-frontend`
- Language: TypeScript
- Framework: Next.js 14 with React 18
- Styling: Tailwind CSS and CSS files under `src/styles`
- UI packages: Radix UI packages and local shared UI components
- Data/client libraries: TanStack Query, Axios
- State management: Zustand and existing shared stores
- Tests: Node test runner through `npm test`
- Package manager files present: `package.json`, `package-lock.json`, `bunfig.toml`

### Backend

- Folder: `autowash-backend`
- Language: Java 21
- Framework: Spring Boot 3.3.5
- Build: Maven
- Backend libraries present: Spring Web, Spring Security, Spring Data JPA, Spring Validation, Spring Mail
- API docs: Springdoc OpenAPI
- Database/migration: Flyway, PostgreSQL driver, H2 runtime/test support
- Auth/token library: JJWT
- Code helpers: Lombok

---

## Current Project Type

This is a full-stack Auto Car Wash Management System.

Current visible domains include:

- Authentication and OTP flows
- Customer profile and preferences
- Customer vehicles
- Booking and booking points
- Catalog/services/packages/combos
- Loyalty, points, vouchers, and promotions
- Customer wash history and wash tracking
- Staff operations and wash sessions
- Admin dashboard, booking, reporting, promotion, and voucher flows
- Notifications and support UI

---

## Current Folder Structure

The repository already has an accepted structure. Do not replace it with a generic recommendation.

### Repository Root

```text
Smart-Automated-Car-Wash-Management-System/
  .github/
  .idea/
  autowash-backend/
  autowash-frontend/
  docs/
  scripts/
  .gitignore
  CLAUDE.md
  README.md
```

### Backend Structure

```text
autowash-backend/
  pom.xml
  run-local.ps1
  DB_RESET.md
  src/main/java/com/autowash/
    AutowashBackendApplication.java
    controller/
    dto/
    entity/
      enums/
    repository/
    service/
    shared/
      config/
      dto/
      exception/
      security/
  src/main/resources/
    application.properties
    db/migration/
      V1__init_schema.sql
  src/test/java/com/autowash/
    admin/
    architecture/
    auth/
    booking/
    catalog/
    loyalty/
    operation/
    shared/
    user/
    vehicle/
  src/test/resources/
    application-test.yml
```

Backend architecture is currently a layered Spring Boot structure:

```text
controller -> service -> repository/entity
shared     -> common config, DTO wrappers, exceptions, security
dto        -> request/response records and API contracts
entity     -> JPA entities and enums
repository -> Spring Data repositories
service    -> business orchestration and domain logic
```

Do not describe or force this backend as Clean Architecture unless the project is explicitly refactored to that structure.

### Frontend Structure

```text
autowash-frontend/
  package.json
  package-lock.json
  next.config.mjs
  tailwind.config.ts
  tsconfig.json
  src/
    app/
      (admin)/
      (auth)/
      (customer)/
      (staff)/
      auth/
      _components/
    assets/
    features/
      admin/
      auth/
      customer/
      public/
      staff/
      support/
    shared/
      components/
      hooks/
      legacy/
      lib/
      store/
      types/
    styles/
  public/
  prototype-src/
  test/
```

Frontend architecture is currently feature-oriented around Next.js App Router:

```text
src/app      -> route groups, pages, layouts, route-level composition
src/features -> feature-specific UI, hooks, services, stores, and types
src/shared   -> reusable components, hooks, libs, stores, and shared types
src/styles   -> global, component, and page CSS
prototype-src -> legacy/prototype reference only
```

Treat `prototype-src` as reference/legacy material. Do not expand or migrate from it unless the user explicitly asks.

### Docs Structure

```text
docs/
  backend-split/
  context/
  master/
  specs/
  superpowers/
```

Use `docs/` for context before making broad product, backend split, or API decisions.

---

## Database And Migration Rules

- Current migration source: `autowash-backend/src/main/resources/db/migration/V1__init_schema.sql`.
- Local reset guide: `autowash-backend/DB_RESET.md`.
- Current identity/customer tables:
  - `users`
  - `user_preferences`
  - `refresh_tokens`
  - `otp_verifications`
  - `vehicles`
- Old tables are not current source of truth:
  - `auth_users`
  - `customer_vehicles`
  - `otp_records`
- Do not change migrations, entity fields, table names, or auth schema unless the user explicitly asks for a database/schema task.
- If database and entity mappings differ, analyze the mismatch first and propose a safe migration plan before editing.

---

## Frontend Development Rules

1. Keep files in `src/app` thin. Pages and layouts should compose feature/shared components.
2. Put feature-specific behavior under `src/features/<domain>`.
3. Put reusable UI, hooks, stores, and utilities under `src/shared`.
4. Do not import prototype files into production code unless explicitly requested.
5. Do not add new frontend libraries unless the user approves and the need is clear.
6. Match existing UI/component patterns before creating new abstractions.
7. Use existing service/query/store patterns for API interaction and state.

---

## Backend Development Rules

1. Keep controllers focused on HTTP request/response handling.
2. Put business orchestration in services.
3. Put persistence access in repositories.
4. Keep JPA mapping inside entities and enums.
5. Use DTOs for API request/response contracts.
6. Use `shared` only for cross-cutting config, exception handling, response wrappers, and security.
7. Do not place SQL or business workflows directly in controllers.
8. Do not change entity fields, database schema, auth flow, or build config without explicit user approval.
9. Follow the current package structure instead of introducing a new architecture layout.

---

## Validation Commands

Run only the commands relevant to the files changed.

### Frontend

```powershell
cd autowash-frontend
npm test
npm run build
npm run lint
```

### Backend

If Maven is available in `PATH`:

```powershell
cd autowash-backend
mvn test
```

If Maven is not available in `PATH`, the machine may have NetBeans bundled Maven:

```powershell
cd autowash-backend
& 'C:\Program Files\NetBeans-13\netbeans\java\maven\bin\mvn.cmd' test
```

### Database Verification

```powershell
$env:PGPASSWORD='autowash'
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' 'postgresql://autowash@localhost:5432/autowash' -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
```

Do not claim tests, builds, or migrations passed unless the command was actually run and the output confirms it.

---

## Global Development Rules

1. Analyze existing files before creating or editing code.
2. Keep changes small, scoped, and easy to review.
3. Do not rewrite the project structure unless explicitly requested.
4. Do not change stack, package manager, build config, auth flow, or schema without approval.
5. Reuse existing DTOs, services, repositories, hooks, stores, and UI components when possible.
6. Do not add duplicate services/components for the same responsibility.
7. Do not add dependencies without explaining why and getting approval.
8. Preserve naming conventions already used in the touched area.
9. Document validation honestly, including commands that could not be run.
10. If a request conflicts with current architecture, explain the conflict and propose the safest alternative.

---

## Workflow Guide

### 1. Discovery

Use this when starting a broad task.

```text
Discovery Summary:
- Project area:
- Relevant folders:
- Current implementation:
- Constraints:
- Missing information:
- Recommended next step:
```

### 2. Architecture Planning

Use this before moving files or changing boundaries.

```text
Architecture Plan:
- Current structure assessment:
- Proposed placement:
- Dependency rules:
- Files/folders that must not change:
- Risks:
- Implementation sequence:
```

### 3. Feature/API Specification

Use this when behavior, API contracts, or UI states need definition.

```text
Feature Specification:
- Feature name:
- Business goal:
- Functional requirements:
- API contract:
- UI behavior:
- Edge cases:
- Acceptance criteria:
```

### 4. Implementation Planning

Use this for medium or large changes.

```text
Implementation Plan:
1. Step name
   - Files:
   - Reason:
   - Validation:

Risk Review:
- Risk:
- Mitigation:
```

### 5. Controlled Coding

Implement only the approved scope. Avoid unrelated refactors.

### 6. Validation And Review

```text
Validation Report:
- Frontend:
- Backend:
- Database:
- Manual checks:
- Known limitations:
```

### 7. Delivery Summary

```text
Delivery Summary:
- Completed:
- Changed files:
- Architecture impact:
- Validation result:
- Remaining work:
```

---

## Forbidden Actions

AI tools must not:

- Rewrite the full project without explicit approval.
- Replace the current layered backend structure with another architecture without approval.
- Modify code outside the requested scope.
- Modify files other than the requested documentation file in docs-only tasks.
- Change database schema, entity fields, migrations, auth flow, or build configuration without explicit approval.
- Add new libraries or tools without approval.
- Put business logic in Next.js route files or Spring controllers.
- Ignore failing tests or pretend validation passed.
- Delete files unless explicitly requested.

---

## Final Instruction

Optimize for maintainability over quick generation.

Understand the current AutoWash system first.
Preserve the existing structure while coding.
Validate what changed and report results honestly.
