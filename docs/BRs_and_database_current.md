# AutoWash BRs and Current Database Summary

> Source of truth used for this summary:
> - Backend schema: `autowash-backend/src/main/resources/db/migration/V1__init_schema.sql`
> - BR inventory: `docs/specs/detail.md`, `docs/context/BACKEND_CONTEXT.md`, and existing `docs/List_BRs.md`
> - Entity/schema reconciliation: `docs/backend-schema-entity-mapping-report.md`

## Scope

This document is a consolidated audit note for:

1. The business rules currently documented in the repository.
2. The current database structure defined by the backend migration.
3. A short list of code/database mismatches that should be reviewed.

## BR Inventory

The repository currently describes 125 BRs, grouped into 10 functional areas.

### 1. Authentication, Access, and Localization

- BR-01: Public landing page for unauthenticated users.
- BR-02: Authenticated users are redirected away from guest pages.
- BR-03: Role home paths are customer, staff, and admin dashboards.
- BR-04: Protected routes redirect unauthenticated users to login.
- BR-05: Unauthorized protected routes render access denied.
- BR-06: Customer login requires a valid local auth account and active customer record.
- BR-07: Staff login requires a valid active staff record.
- BR-08: Demo role switching can replace the current workspace role.
- BR-09: Customer-facing copy supports English and Vietnamese.
- BR-10: Customer booking module persists selected language in localStorage.

### 2. Customer Registration and Profile

- BR-11: Registration requires full name, Vietnamese phone number, **email**, password, and confirm password. All five fields are mandatory in `RegisterRequest` (`@NotBlank` on each).
- BR-12: ~~Registration form does not collect email in the current UI.~~ **Corrected:** `RegisterRequest` declares `@NotBlank @Email` on `email` — email is **required** in the backend. This BR only applies to the frontend prototype UI, not the backend API.
- BR-13: ~~Password must be at least 6 characters.~~ **Corrected:** Backend enforces a pattern of **8–128 characters** with at least one uppercase letter, one lowercase letter, one digit, and one special character (`RegisterRequest` password `@Pattern`). Staff password reset (`ResetPasswordRequest`) also requires 8–72 characters.
- BR-14: Confirm password must match password. Enforced via `@AssertTrue isPasswordConfirmed()` in `RegisterRequest`.
- BR-15: Phone number must match Vietnamese local format (`^0[0-9]{9}$`). Enforced via `@Pattern` in `RegisterRequest` and login identifier resolution in `AuthServiceImpl`.
- BR-16: Registration starts an OTP challenge.
- BR-17: OTP must be verified before activation. OTP code must be exactly 6 digits (`^[0-9]{6}$`), enforced via `@Pattern` in `VerifyOtpRequest`.
- BR-18: Registration OTP can be resent while pending. Resend is rate-limited to 3 requests per hour per account.
- BR-19: New customer is created with tier `MEMBER`, 0 points, and `PENDING` status (activated to `ACTIVE` after OTP verification).
- BR-20: If no email is supplied, a placeholder local email is generated.
- BR-21: Phone numbers must be unique among active customers and auth accounts.
- BR-22: Profile editing requires non-empty full name (max 100 chars), optional valid email, and Vietnamese phone (`^0[0-9]{9}$`). Updating the profile also marks the customer as no longer new (`markNotNewCustomer()`).
- BR-23: Profile page displays phone and email as verified.
- BR-24: Shared store supports pending phone-change OTP flow, but UI does not expose it.
- BR-25: Forgot password flow uses email or phone lookup, OTP verification, and password reset. The backend fully implements this via `AuthServiceImpl.requestForgotPassword()` and `resetForgotPassword()`. *(The original description "standalone UI simulation with hardcoded OTP" applies only to the frontend prototype, not the backend.)*

### 3. Vehicle Management

- BR-26: Customer booking pages cannot proceed when vehicle list is empty.
- BR-27: Vehicle creation requires plate, vehicle type, brand, model, and year. All five fields are mandatory (`@NotBlank`/`@NotNull` in `CreateVehicleRequest`). Color is optional (max 30 chars).
- BR-28: Brand is selected first, then model from a brand-specific catalog.
- BR-29: Vehicle type must be one of the valid `VehicleType` values: `CAR`, `SUV`, `TRUCK`, `MOTORBIKE`, `VAN`.
- BR-30: Vehicle color is optional.
- BR-31: Vehicle photo upload is optional, but uploaded files must be images.
- BR-32: The first customer-booking vehicle becomes default automatically.
- BR-33: Marking a vehicle as default unsets other defaults.
- BR-34: Deleting the default vehicle promotes the first remaining vehicle to default.
- BR-35: Backend normalizes plates to uppercase and trims spaces via `VehicleServiceImpl.normalizePlate()`.
- BR-36: Plate must match Vietnamese plate format `^[0-9]{2}[A-Z]-[0-9]{6}$` (e.g. `30H-123456`). Enforced via `@Pattern` in `CreateVehicleRequest` at the API level.
- BR-37: Active customer cannot take a plate already owned by another active customer.
- BR-38: Plate from an inactive owner can be transferred and logged to ownership history.
- BR-39: Vehicle deletion is blocked when the customer would be left with zero vehicles. ⚠️ *The backend does NOT enforce this. `VehicleServiceImpl.deleteVehicle()` performs a soft-delete without checking the remaining active vehicle count.*
- BR-40-V: Vehicle year must be a valid integer between 1900 and 2100 (`@Min(1900) @Max(2100)` in `CreateVehicleRequest` and `UpdateVehicleRequest`).

### 4. Customer Booking and Payment Simulation

- BR-40: Customer booking form supports SINGLE_PACKAGE and COMBO.
- BR-41: Only ACTIVE service packages appear in checkout flow.
- BR-42: Combo mode is disabled when there is no active combo or no remaining uses.
- BR-43: Combo mode auto-locks to the combo-linked vehicle and package.
- BR-44: Single-package mode allows service selection; combo mode does not.
- BR-45: Booking schedule defaults to tomorrow at 10:30.
- BR-46: Time picker blocks slots already occupied by active module-local bookings.
- BR-47: Customer booking supports one voucher per booking. Voucher code must be uppercase alphanumeric with no spaces (`^[A-Z0-9_-]+$`), enforced via `@AssertTrue isValidVoucherCode()` in `CreateBookingRequest`.
- BR-48: Manual voucher entry only works for a currently usable customer voucher.
- BR-49: Voucher must be owned, active, unexpired, in limit, tier-eligible, and new-customer valid if flagged.
- BR-50: Payment methods are cash at counter, bank transfer, and e-wallet.
- BR-51: Bank transfer and e-wallet bookings are created with `PENDING_PAYMENT` status (not immediately `PAID`). Zero-amount combo bookings follow the same rule — initial status depends solely on payment method. *(The phrase "marked paid immediately" is inaccurate; the backend sets `PENDING_PAYMENT` for non-cash methods and only marks `PAID` when `payBooking()` is called.)*
- BR-52: Cash bookings are stored with pay-at-counter behavior.
- BR-53: Combo bookings use `base_amount = 0` when the customer already owns an active combo. The final amount may still be non-zero if add-on options are selected. *(The original text "always store final amount 0" is inaccurate — options surcharges still apply.)*
- BR-54: A new booking is created with status **`PENDING`**. It transitions to `CONFIRMED` automatically when payment is completed via `payBooking()` (for cash bookings that were initially `UNPAID`). *(The original "status Confirmed" on creation is inaccurate — the default initial status is `PENDING`.)*
- BR-54-CS: Booking carries a derived `confirmationStatus` field (transient, not stored in DB): `PENDING` → `PENDING`, `CONFIRMED/CHECKED_IN/IN_PROGRESS/COMPLETED` → `VERIFIED`, `CANCELLED` → `CANCELLED`, `NO_SHOW` → `EXPIRED`.
- BR-55: Confirming a booking immediately marks the selected voucher as used and increments usage count.
- BR-56: Success screen shows booking code, vehicle, service, schedule, voucher, payment, status, and amount.

### 5. Shared Booking and Operational Lifecycle

- BR-57: Shared-store booking creation is blocked for blocked customers. ⚠️ *Documented as intended behavior; not yet enforced in `BookingServiceImpl.createBooking()` — customer status is not checked before booking creation. See Suggested BR-S01.*
- BR-58: Shared-store booking creation is blocked while suspension is active. ⚠️ *Documented as intended behavior; no suspension mechanism exists in the backend. See Suggested BR-S02.*
- BR-59: Booking date must be today or in the future (`@FutureOrPresent` on `CreateBookingRequest.bookingDate`). There is no concept of "walk-in" in the backend — the constraint applies to all bookings.
- BR-60: Shared-store booking window depends on the customer tier. ⚠️ *Documented as intended behavior; no tier-based booking window logic exists in the backend. See Suggested BR-S03.*
- BR-61: Shared-store non-walk-in customers can hold at most 3 active bookings.
- BR-62: Duplicate booking by same vehicle, date, and slot is not allowed while active. ⚠️ *Documented as intended behavior; no uniqueness check or DB constraint for (vehicle, date, slot) combination exists in the backend. See Suggested BR-S04.*
- BR-63: Shared-store slot capacity is limited by shop capacity. ⚠️ *Documented as intended behavior; no shop capacity limit logic exists in the backend. See Suggested BR-S05.*
- BR-64: Shared-store reserves the last open slot for Platinum customers when applicable. ⚠️ *Documented as intended behavior; no Platinum slot reservation logic exists in the backend. See Suggested BR-S06.*
- BR-65: Shared-store customer notes are sanitized before storage.
- BR-66: Shared-store cancellation is only allowed from Pending or Confirmed.
- BR-67: Shared-store cancellation is blocked when booking starts in less than 2 hours. ⚠️ *Documented as intended behavior; `cancelBooking()` only checks booking status, not time proximity. See Suggested BR-S07.*
- BR-68: Shared-store auto-ban can block a customer after repeated cancellations. ⚠️ *Documented as intended behavior; `BookingServiceImpl.cancelBooking()` does not count previous cancellations or trigger any blocking logic. See Suggested BR-S15.*
- BR-69: Shared-store operational check-in is allowed only from Confirmed or Pending.
- BR-70: Shared-store operational check-in marks a booking No-show if arrival is more than 20 minutes late. ⚠️ *Documented as intended behavior; no late-arrival / no-show time threshold logic exists in `OperationsServiceImpl` or `WashSessionLifecycle`. See Suggested BR-S08.*
- BR-71: Legacy session preparation marks a booking No-show if arrival is more than 15 minutes late. ⚠️ *Documented as intended behavior; not implemented in the backend. Superseded by BR-70 in the current architecture. See Suggested BR-S08.*
- BR-72: Two no-shows inside 30 days in the legacy path trigger a 14-day suspension. ⚠️ *Documented as intended behavior; no auto-suspension logic exists anywhere in the backend. See Suggested BR-S09.*
- BR-73: A wash session is created with status **`PENDING`** via `WashSession.create()`. It must be explicitly transitioned to `QUEUED` by calling `queueSession()`, then to `CHECKED_IN`, `IN_PROGRESS`, and finally `COMPLETED`. *(The original "creates in Queued state" is inaccurate — initial status is `PENDING`.)* Assigns active staff at creation time.
- BR-73-ST: Customer can track their active wash session in real time via `CustomerWashTrackingServiceImpl.getActiveSession()`. The session shows status, assigned staff name, projected points, and timestamps (checked-in, started, completed).
- BR-74: Shared-store operational wash start is allowed only after Checked-in.
- BR-75: Starting a wash updates booking wash status to In Progress.
- BR-76: Completing an operational wash is allowed only when booking is Checked-in and wash is In Progress.
- BR-77: Completing an operational wash records completion time, transaction references, and earned points.

### 6. Staff Operations

- BR-78: Staff dashboard links to Operations and Check-in Queue only.
- BR-79: Staff pages are accessible only to the Staff role. Staff can only view and operate on wash sessions assigned to them (`OperationsServiceImpl.requireSessionForCurrentUser()`).
- BR-80: Operations board shows booking code, customer, plate, package, staff, times, status, and next action.
- BR-81: Staff queue supports filters by status, time bucket, hour, staff, and free-text query.
- BR-82: Check-in panel requires manual plate verification before enabling check-in.
- BR-83: Start washing is enabled only when the booking is already checked in.
- BR-84: Complete wash is enabled only when the booking is in progress.
- BR-85: Staff assignment uses only staff whose status is Active.
- BR-86: A busy staff member cannot be assigned to another non-completed wash session.

### 7. Loyalty, Points, and Membership

- BR-87: ~~Customer booking module uses tiers Silver, Gold, and Diamond.~~ **Corrected:** The backend (`LoyaltyTier` enum and `LoyaltyRules.java`) defines exactly four tiers: `MEMBER`, `SILVER`, `GOLD`, `PLATINUM`. The tier `Diamond` does not exist anywhere in the backend. Any frontend prototype reference to "Diamond" is inconsistent with the backend and should be updated to align with `PLATINUM`.
- BR-88: The system uses tiers `MEMBER`, `SILVER`, `GOLD`, and `PLATINUM` across both the backend loyalty engine and the shared portal store.
- BR-89: Point-to-voucher redemption requires at least 50 points and at most 200 points per redemption. This limit applies to both standalone redemption (`redeemPoints()`) and apply-to-booking (`applyPointsToBooking()`), enforced both at service layer (`validateRedemptionAmount()`) and DTO level (`@Min/@Max` in `ApplyPointsRequest`).
- BR-90: Redemption rate is 1 point = 1,000 VND voucher value in the customer booking module.
- BR-91: A customer can hold at most 3 active point-redeem vouchers at once. ⚠️ *This limit is NOT enforced in the backend. `LoyaltyServiceImpl.redeemPoints()` creates vouchers without checking an existing active count.*
- BR-92: Point voucher redemption immediately subtracts points and adds a REDEEM transaction in the customer booking module.
- BR-93: Combo upgrade in the customer booking module awards a fixed 250-point bonus.
- BR-94: Shared-store checkout calculates earned points from floor(finalAmount / 10000) * tier multiplier.
- BR-95: Shared-store redemption can redeem only whole points and caps redemption by balance and payable amount.
- BR-96: Points redemption is blocked when the customer has insufficient points (`INSUFFICIENT_POINTS`). ⚠️ *Blocked customer check: `LoyaltyServiceImpl.redeemPoints()` does NOT verify `user.getStatus()`. A blocked customer can still redeem points.*
- BR-97: Tier evaluation is triggered on every point-earn event. The current backend (`LoyaltyServiceImpl.evaluateTierUpgrade`) calculates the customer's tier from their **lifetime total EARN points** (sum of all `EARN` transactions). ⚠️ *The original specification described a rolling 12-month window; the implemented behavior uses lifetime points. These two approaches diverge as customers accumulate history. Align the spec or the implementation — see Suggested BR-S10.*
- BR-98: Shared-store earned loyalty lots expire after 365 days and can trigger 30-day and 7-day warnings.

### 8. Promotions, Vouchers, and Combos

- BR-99: Customer booking module treats promotions as voucher-like discounts.
- BR-100: New-customer vouchers are usable only when local customer profile is marked isNewCustomer.
- BR-101: Combo upgrade is allowed only when target combo is more expensive than the current active combo.
- BR-102: Combo upgrade requires at least one known vehicle.
- BR-103: Promotions are validated by active flag (`ACTIVE`), date range (`start_at <= now < end_at`), and eligible tier. Promotions linked to a booking at creation time are stored in `booking_promotions` and their `point_multiplier` is used at point-earn time. The highest multiplier among all linked promotions is used (`bookingPromotionMultiplier()`).
- BR-104: Admin promotion form presents three targeting modes in UI.
- BR-105: Admin promotion form requires a name (max 120 chars, uppercase alphanumeric `^[A-Z0-9_-]+$`), point multiplier (0.0–99.99), start date, end date, targeting mode, and at least one tier when `SPECIFIC_TIERS` is selected. Validated in `PromotionServiceImpl.validate()`.
- BR-105-V: Admin voucher creation requires: code (max 50 chars, uppercase `^[A-Z0-9_-]+$`), name (max 120 chars), discount type, discount value ≥ 1, min order amount ≥ 0, start date, end date. End date must be after start date. If discount type is `PERCENT`, discount value must be ≤ 100. Validated in `AdminVoucherServiceImpl.validateRequest()`.
- BR-106: In the shared store, new customers only is currently translated into Member tier targeting.
- BR-107: Shared-store promotion creation is blocked when start date is after end date.
- BR-108: Shared-store package removal is blocked if an active booking still references that package.
- BR-109: Shared-store package status can be ACTIVE or INACTIVE.

### 9. Admin Management UI

- BR-110: Admin dashboard KPI cards are derived from live DB data via `AdminDashboardMetricsServiceImpl`: total bookings, total revenue (sum of `CONFIRMED` booking final amounts), total customers, and active promotions count.
- BR-110-SM: Admin can manage staff accounts: create (`createStaff()`), update profile (`updateStaff()`), update status (`updateStaffStatus()`), and soft-delete by setting status to `INACTIVE` (`deleteStaff()`). Staff creation requires unique phone and email, and password is stored hashed.
- BR-111: Admin dashboard booking list can be filtered by date and paginated.
- BR-112: Admin bookings page supports filters for status, date, and customer name.
- BR-113: Admin bookings page maps In Progress from Checked-in plus wash status In Progress.
- BR-114: Admin bookings page does not let users manually set IN_PROGRESS.
- BR-115: Booking detail drawer shows staff assignment editable only when a linked wash session exists and it is In Progress.
- BR-116: Customer directory supports search, tier filter, status filter, pagination, and detail drilldown.
- BR-117: Customer detail tabs are Profile, Vehicles, Bookings, Wash History, Point Transactions, and Tier History.
- BR-118: Customer status changes persist to the shared store from admin detail view.
- BR-119: Admin can update a customer's role via `PUT /api/v1/admin/customers/{id}/role`. The role change is **persisted to the database** via `AdminReportingServiceImpl.updateCustomerRole()`. *(The original "presentation-only in this prototype" is inaccurate for the backend — it is a real persisted operation.)*
- BR-120: Admin settings persist to browser localStorage on the current device. *(Backend has no equivalent — this is frontend-only behavior.)*
- BR-121: Reports are derived from the live database via `AdminReportingServiceImpl.getBusinessHealthReport()`, including booking trends, revenue breakdowns, and promotion attribution. *(The original "shared store only" is inaccurate — the backend computes reports directly from DB.)*

### 10. Notifications and Audit-Like Behavior

- BR-122: Customer reminder watcher polls every 30 seconds and fires notifications for due reminders.
- BR-123: Reminder notifications are deduplicated via reminder keys stored in localStorage.
- BR-124: Booking confirmation, checkout completion, auto-suspension, and loyalty expiry warnings push local notification items into the store.
- BR-125: Vehicle ownership transfers, tier changes, ledger entries, and adjustments are stored as audit-like local records.

## BR Index by Area

| Area | BR Range | Count | Notes |
|---|---:|---:|---|
| Authentication, Access, and Localization | BR-01 to BR-10 | 10 | |
| Customer Registration and Profile | BR-11 to BR-25 | 15 | BR-11–BR-13 corrected; BR-17 (OTP 6-digit format added); BR-18 (rate limit added); BR-22 (markNotNewCustomer side-effect added); BR-25 corrected |
| Vehicle Management | BR-26 to BR-40-V | 15 | BR-27 corrected (5 required fields); BR-29 corrected (enum values); BR-36 corrected (plate format already enforced); BR-40-V added (year range) |
| Customer Booking and Payment Simulation | BR-40 to BR-56 | 18 | BR-47 (voucher code format added); BR-51, BR-53, BR-54 corrected; BR-54-CS added (confirmation status) |
| Shared Booking and Operational Lifecycle | BR-57 to BR-77 | 22 | ⚠️ 10 BRs not yet implemented; BR-73 corrected (initial status PENDING); BR-73-ST added (customer live tracking) |
| Staff Operations | BR-78 to BR-86 | 9 | BR-79 updated (staff session ownership added) |
| Loyalty, Points, and Membership | BR-87 to BR-98 | 12 | BR-87 corrected; BR-89 updated (both paths + DTO enforcement); BR-91 ⚠️; BR-96 ⚠️; BR-97 diverges from spec |
| Promotions, Vouchers, and Combos | BR-99 to BR-109 | 11 | BR-103 updated (multiplier logic); BR-105 updated (name format + voucher validation added as BR-105-V) |
| Admin Management UI | BR-110 to BR-121 | 13 | BR-110 updated (KPI from DB); BR-110-SM added (staff management); BR-119 corrected; BR-121 corrected |
| Notifications and Audit-Like Behavior | BR-122 to BR-125 | 4 | BR-122–BR-124: frontend-only; backend has `notifications` table and `NotificationServiceImpl` |
| **Total (core)** | **BR-01 to BR-125 + extensions** | **139** | |

## Current Database

The current backend migration defines the following main entities and relationship tables.

### Core Identity

- `users`
- `user_preferences`
- `refresh_tokens`
- `otp_verifications`

### Vehicle and Catalog

- `vehicles`
- `packages`
- `services`
- `package_services`
- `combos`
- `combo_services`

### Voucher and Promotion

- `vouchers`
- `voucher_tiers`
- `promotions`
- `promotion_tiers`

### Booking and Payment

- `bookings`
- `booking_options`
- `booking_promotions`
- `booking_status_histories`
- `payments`
- `wash_sessions`

### Loyalty and Combo Usage

- `loyalty_accounts`
- `point_transactions`
- `tier_histories`
- `customer_combos`
- `customer_combo_usages`

### Notifications

- `notifications`

## Key Enum / Status Domains

- `user_role`: `CUSTOMER`, `STAFF`, `ADMIN`
- `user_account_status`: `PENDING`, `ACTIVE`, `BLOCKED`, `SUSPENDED`, `INACTIVE` *(Note: DB schema and `UserStatus` enum use `SUSPENDED`, not `DELETED`. Any reference to `DELETED` as a user status is incorrect.)*
- `vehicle_status`: `ACTIVE`, `INACTIVE`, `DELETED`
- `active_status`: `ACTIVE`, `INACTIVE`
- `discount_type`: `PERCENT`, `FIXED_AMOUNT`
- `loyalty_tier`: `MEMBER`, `SILVER`, `GOLD`, `PLATINUM`
- `promotion_targeting_mode`: `ALL_TIERS`, `SPECIFIC_TIERS`
- `booking_type`: `PACKAGE`, `COMBO`
- `booking_status`: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- `payment_method`: `CASH_AT_COUNTER`, `BANK_TRANSFER`, `E_WALLET`
- `payment_status`: `UNPAID`, `PENDING_PAYMENT`, `PAID`, `FAILED`, `REFUNDED`
- `wash_session_status`: `PENDING`, `QUEUED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `point_transaction_type`: `EARN`, `REDEEM`, `EXPIRE`, `ADJUST`
- `customer_combo_status`: `ACTIVE`, `EXPIRED`, `USED_UP`, `CANCELLED`

## Important Database Constraints

- `users.phone` and `users.email` are unique.
- `vehicles.plate` is unique.
- `loyalty_accounts.customer_id` is unique.
- `payments.booking_id` is unique.
- `wash_sessions.booking_id` is unique.
- `customer_combo_usages.booking_id` is unique.
- Most relationship tables cascade on delete from their parent rows.
- Numeric fields for prices, counts, and points have non-negative checks in the migration.
- Several tables enforce date validity with `end_at > start_at` or equivalent checks.

## Notable Code / Database Gaps

These are the highest-value inconsistencies visible from the current schema and code mapping report:

1. `users.status` — **Resolved.**
   - Migration and `UserStatus` enum both include `PENDING`, `ACTIVE`, `BLOCKED`, `SUSPENDED`, `INACTIVE`. Consistent.
   - Note: the DB schema lists `SUSPENDED` as a valid status value; the document's enum table lists `DELETED` instead. **`DELETED` does not exist in DB or enum — the correct value is `SUSPENDED`.** See correction in Key Enum / Status Domains above.

2. `wash_sessions.status`
   - Migration includes `QUEUED` and `WashSessionLifecycle` validates transitions through it. Consistent.

3. Enum mapping style
   - The codebase uses Java enums mapped to `CHECK` string columns rather than native SQL enum types. Consistent as long as string values remain aligned.

4. `Vehicle.plate`
   - DB has `UNIQUE NOT NULL` constraint. `VehicleServiceImpl` explicitly checks `existsByPlate` and throws `DUPLICATE_PLATE`. Consistent.

5. Booking / promotion / loyalty behavior
   - The repository has both module-local prototype behavior (frontend) and backend-enforced behavior. Some BRs remain prototype-only; these are flagged ⚠️ in the BR list above and detailed in the Suggested BRs section.

## Practical Interpretation

If you want one file to hand to a developer or auditor, this document should be read together with:

- `docs/specs/detail.md` for the detailed BR definitions.
- `docs/database_schema.md` for the ERD-style database overview.
- `autowash-backend/src/main/resources/db/migration/V1__init_schema.sql` for the actual current schema.

For implementation work, the migration file is the authoritative database source.

---

## Suggested BRs — Backend Not Yet Implemented

The following rules were documented in the original BR inventory but are **not enforced in the current backend**. They are retained here as implementation candidates. Each maps back to the original BR that introduced the intent.

> Legend: **Relates to** = original BR that described this behavior; **Scope** = suggested enforcement point.

### BR-S01 — Block booking creation for BLOCKED customers

**Relates to:** BR-57  
**Scope:** `BookingServiceImpl.createBooking()`  
**Rule:** Before creating a booking, check that `user.getStatus() != UserStatus.BLOCKED`. If blocked, throw `ApiException(422, "Account is blocked", "ACCOUNT_BLOCKED")`.

---

### BR-S02 — Block booking creation during active suspension

**Relates to:** BR-58  
**Scope:** `BookingServiceImpl.createBooking()`, requires a new `suspension` mechanism (field or table)  
**Rule:** A customer with an active suspension record (start ≤ now < end) cannot create a new booking. Throw `ApiException(422, "Account is suspended", "ACCOUNT_SUSPENDED")`.  
**Note:** No suspension table or field currently exists. Implementation requires a schema addition (e.g., `users.suspended_until TIMESTAMP`) or a dedicated `suspensions` table.

---

### BR-S03 — Booking window limit by loyalty tier

**Relates to:** BR-60  
**Scope:** `BookingServiceImpl.createBooking()`  
**Rule:** The maximum number of days ahead a customer can schedule a booking should depend on their tier. Example: MEMBER = 7 days, SILVER = 14 days, GOLD = 21 days, PLATINUM = 30 days. Throw `ApiException(422, "Booking date exceeds allowed window for your tier", "BOOKING_WINDOW_EXCEEDED")`.

---

### BR-S04 — Prevent duplicate booking for same vehicle, date, and time slot

**Relates to:** BR-62  
**Scope:** `BookingServiceImpl.createBooking()` + DB unique constraint  
**Rule:** A customer cannot create a booking if an active booking (status in `PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS`) already exists for the same `(vehicle_id, booking_date, booking_time)`. Throw `ApiException(422, "A booking already exists for this vehicle at the selected date and time", "DUPLICATE_BOOKING")`.  
**Note:** Consider adding a partial unique index on `bookings(vehicle_id, booking_date, booking_time)` filtered to active statuses for DB-level enforcement.

---

### BR-S05 — Enforce shop slot capacity per time slot

**Relates to:** BR-63  
**Scope:** `BookingServiceImpl.createBooking()`  
**Rule:** Count active bookings for the requested `(booking_date, booking_time)` slot. If count ≥ shop capacity (configurable, e.g., via `application.properties`), reject the booking with `ApiException(422, "No available slots for the selected time", "SLOT_FULL")`.

---

### BR-S06 — Reserve last open slot for Platinum customers

**Relates to:** BR-64  
**Scope:** `BookingServiceImpl.createBooking()`, depends on BR-S05  
**Rule:** When a slot has exactly one remaining opening, only a `PLATINUM` customer may take it. Non-Platinum customers receive `SLOT_FULL`. This check runs after the regular capacity check passes for Platinum.

---

### BR-S07 — Block cancellation within 2 hours of scheduled time

**Relates to:** BR-67  
**Scope:** `BookingServiceImpl.cancelBooking()`  
**Rule:** After confirming the booking is in a cancellable status, check that `scheduledAt - now > 2 hours`. If the booking starts in less than 2 hours, throw `ApiException(422, "Booking cannot be cancelled less than 2 hours before the scheduled time", "CANCELLATION_TOO_LATE")`.

---

### BR-S08 — Mark booking as No-show when check-in is too late

**Relates to:** BR-70 (replaces deprecated BR-71)  
**Scope:** `OperationsServiceImpl.checkInSession()` or a scheduled task  
**Rule:** When performing check-in, if `now - booking.scheduledAt > 20 minutes`, transition the booking to `NO_SHOW` instead of `CHECKED_IN`, and transition the wash session to `CANCELLED`. Throw `ApiException(422, "Check-in window expired; booking marked as No-show", "CHECKIN_WINDOW_EXPIRED")`.  
**Alternative:** A scheduled job scans for `CONFIRMED` bookings whose `scheduledAt + 20 minutes < now` and auto-transitions them to `NO_SHOW`.

---

### BR-S09 — Auto-suspend customer after repeated no-shows

**Relates to:** BR-72  
**Scope:** Triggered after BR-S08 marks a `NO_SHOW`  
**Rule:** After each no-show, count `NO_SHOW` bookings for the customer in the last 30 days. If count ≥ 2, set a 14-day suspension (requires the suspension mechanism from BR-S02).  
**Throw:** No exception at the point of suspension; create the suspension record and optionally push a notification.

---

### BR-S10 — Align tier recalculation window: lifetime vs rolling 12 months

**Relates to:** BR-97  
**Scope:** `LoyaltyServiceImpl.evaluateTierUpgrade()` and `lifetimeEarnedPoints()`  
**Current behavior:** Tier is determined from the sum of all `EARN` transactions for the customer (lifetime).  
**Documented intent:** Original spec described a rolling 12-month window.  
**Decision required:** Choose one of:
  - **Option A (current):** Keep lifetime points. Simpler, never demotes customers. Update the spec to match.
  - **Option B (spec-aligned):** Query `SUM(points) WHERE type = EARN AND created_at >= now - 365 days`. Enables tier downgrade over time. Requires a scheduled monthly review job and a `tier_review_date` mechanism.

---

### BR-S11 — Block points redemption for BLOCKED customers

**Relates to:** BR-96  
**Scope:** `LoyaltyServiceImpl.redeemPoints()` and `applyPointsToBooking()`  
**Rule:** Before processing any redemption, check that `customer.getStatus() != UserStatus.BLOCKED`. If blocked, throw `ApiException(422, "Account is blocked", "ACCOUNT_BLOCKED")`.

---

### BR-S12 — Enforce minimum remaining vehicle count on delete

**Relates to:** BR-39  
**Scope:** `VehicleServiceImpl.deleteVehicle()`  
**Rule:** Before soft-deleting a vehicle, count active vehicles for the customer. If the count is 1 (would become 0), throw `ApiException(422, "Cannot delete the last vehicle", "LAST_VEHICLE")`.

---

### BR-S13 — ~~Validate Vietnamese plate format on vehicle creation~~ **Resolved**

**Relates to:** BR-36  
**Status:** ✅ Already implemented. `CreateVehicleRequest` enforces `@Pattern(regexp = "^[0-9]{2}[A-Z]-[0-9]{6}$")` at the DTO/API validation layer. No additional service-layer check is needed.

---

### BR-S15 — Auto-block customer after repeated cancellations

**Relates to:** BR-68  
**Scope:** `BookingServiceImpl.cancelBooking()`  
**Rule:** After each cancellation, count the customer's `CANCELLED` bookings within the last 30 days. If count reaches a configured threshold (e.g., 3), set `customer.updateStatus(UserStatus.BLOCKED)` and optionally push a notification.  
**Note:** Threshold should be configurable (e.g., via `application.properties`). This requires `BookingRepository.countByCustomerAndStatusAndCreatedAtAfter()` or equivalent query.

---

### BR-S14 — Cap active point-redemption vouchers per customer

**Relates to:** BR-91  
**Scope:** `LoyaltyServiceImpl.redeemPoints()`  
**Rule:** Before creating a new redemption voucher, count the customer's currently active vouchers (status = `ACTIVE`, `end_at > now`) that were generated from point redemptions. If count ≥ 3, throw `ApiException(422, "Maximum active redemption vouchers reached", "MAX_VOUCHERS_REACHED")`.
