# Foundation Week Plan

## Timebox

- Start: `2026-05-23`
- End: `2026-05-29`

## Goal for this week

Foundation week must align with the mandatory-first scope in `Project.md`.

By the end of the week, the team should be able to demo:

1. Register
2. OTP verify
3. Login
4. JWT / RBAC
5. Basic profile
6. Vehicle CRUD
7. Package list
8. Booking create / list / detail
9. Staff queue / check-in / start / complete
10. Loyalty earn after complete
11. Promotion targeting basics
12. Admin bookings / customers / point history basics
13. Swagger for priority APIs

## Not in this week unless all mandatory-first items are already stable

- support chat
- advanced live wash tracking
- real payment gateway
- real SMS / email gateway
- export CSV / PDF
- advanced reports
- advanced scheduler

## Definition of done for the week

### Customer can demo

- register
- verify OTP
- login
- view profile
- add / edit / set primary vehicle
- create booking
- view booking list / detail
- see loyalty balance or earned points after complete
- see promotions list

### Staff can demo

- login
- view queue
- check-in booking
- see fee or projected points after check-in
- start wash
- complete wash

### Admin can demo

- login
- view dashboard basic
- view all bookings
- view customers / accounts basic
- view customer point transaction history basic
- manage promotions basic

### Backend can demo

- Swagger / OpenAPI available for priority endpoints

---

## Ownership this week

## Backend 1

- auth
- jwt / rbac
- profile
- vehicle
- booking customer core
- package / add-on / combo / voucher list basics
- Swagger for these APIs

## Backend 2

- operations basic
- loyalty earn / history basics
- promotion CRUD basics
- admin basic
- point history basic
- Swagger for these APIs

## Fullstack 1

- customer auth / profile / vehicle / booking / loyalty / promotions integration

## Fullstack 2

- staff/admin auth + operations/admin integration

## Frontend

- shared layout / components / validators / loading / error states
- support FS1 / FS2 removing mock UI dependencies

---

## Daily plan

## 2026-05-23

### Daily goal

- lock foundation scope
- start auth and app shell
- lock API contract and Swagger-first rule

### Backend 1

1. Create Spring Boot base project, PostgreSQL config, base package structure
2. Create auth and user entities
3. Create `POST /auth/register`
4. Create `POST /auth/login`
5. Standardize response wrapper and global error handler
6. Add Swagger/OpenAPI base setup

### Backend 2

1. Create module skeleton:
   - operation
   - admin
   - loyalty
   - promotion
   - notification
2. Create seed data:
   - 1 admin
   - 2 staff
3. Create `GET /admin/dashboard/metrics` basic
4. Create `GET /operations/queue` skeleton

### Fullstack 1

1. Setup frontend data layer:
   - axios
   - interceptor skeleton
   - auth store
   - query client
2. Wire login page with login API
3. Prepare register page mapping

### Fullstack 2

1. Wire login flow for staff/admin
2. Standardize role redirect:
   - customer
   - staff
   - admin
3. Prepare admin dashboard data fetch basic

### Frontend

1. Standardize auth layouts
2. Standardize shared form input / button / error message
3. Standardize validators:
   - phone
   - password
   - otp
4. Support FS1 / FS2 with field names and DTO labels

### End-of-day expected

- login API callable
- frontend can send login/register requests
- auth app shell runs
- Swagger base route available

---

## 2026-05-24

### Daily goal

- make auth flow usable
- OTP + RBAC + profile basic

### Backend 1

1. Create `POST /auth/otp/send`
2. Create `POST /auth/otp/verify`
3. Create `POST /auth/refresh`
4. Configure JWT filter + RBAC
5. Create `GET /users/profile`
6. Ensure default tier after registration = `MEMBER`
7. Publish auth/profile Swagger docs

### Backend 2

1. Create `GET /admin/accounts` or `GET /admin/customers` basic
2. Create booking/admin read DTO skeleton
3. Prepare operation entities:
   - wash session
   - staff status

### Fullstack 1

1. Wire register page
2. Wire verify OTP page
3. Complete customer login flow
4. Wire customer profile page basic

### Fullstack 2

1. Complete admin login flow
2. Complete staff login flow
3. Wire admin accounts/customers basic list

### Frontend

1. Standardize access denied / unauthenticated UI
2. Standardize loading / skeleton for auth/profile
3. Support auth error mapping:
   - validation
   - invalid credentials
   - unauthorized

### End-of-day expected

- register -> OTP -> login works
- role redirect works
- profile loads after login
- customer default tier is visible as `MEMBER`

---

## 2026-05-25

### Daily goal

- complete vehicle basics
- open path for booking

### Backend 1

1. Create `POST /customers/vehicles`
2. Create `GET /customers/vehicles`
3. Create `GET /customers/vehicles/:id`
4. Create `PUT /customers/vehicles/:id`
5. Create `POST /customers/vehicles/:id/set-primary`
6. Publish vehicle Swagger docs

### Backend 2

1. Create `GET /admin/bookings` basic skeleton
2. Create `GET /admin/bookings/:id` basic skeleton
3. Prepare queue sample mapping from booking/session placeholder

### Fullstack 1

1. Wire vehicles list page
2. Wire add vehicle page
3. Wire vehicle detail/edit page
4. Wire set primary action

### Fullstack 2

1. Wire admin bookings list basic
2. Wire admin booking detail basic
3. Prepare staff operations board data hooks

### Frontend

1. Standardize vehicle card/list/form UI
2. Standardize empty state for vehicles/bookings
3. Support vehicle form validation

### End-of-day expected

- customer can add vehicle
- customer can view vehicles
- admin can see booking screen basic

---

## 2026-05-26

### Daily goal

- complete package list and booking create basic

### Backend 1

1. Create `GET /packages`
2. Create `GET /add-ons`
3. Create `GET /combos/available`
4. Create `GET /vouchers/available`
5. Create `POST /customers/bookings`
6. Create `GET /customers/bookings`
7. Create `GET /customers/bookings/:id`
8. Publish booking/catalog Swagger docs

### Backend 2

1. Prepare wash session service skeleton
2. Prepare endpoints:
   - create wash session
   - queue
3. Align admin booking detail with booking payload

### Fullstack 1

1. Wire booking step 1:
   - select vehicle
2. Wire booking step 2:
   - package / combo list
3. Wire booking step 3:
   - add-ons basic
4. Wire submit create booking

### Fullstack 2

1. Align admin booking detail with backend payload
2. Prepare staff queue page rendering against queue contract

### Frontend

1. Standardize checkout stepper UI
2. Standardize booking summary card
3. Support FS1 payload mapping for checkout form

### End-of-day expected

- customer can select vehicle + package
- customer can create booking basic
- booking list starts using real data

---

## 2026-05-27

### Daily goal

- complete customer booking demo
- start real staff operations

### Backend 1

1. Complete `GET /customers/bookings/:id`
2. Fix create booking validation:
   - date/time
   - required vehicle/package
3. Create `POST /bookings/validate-voucher` basic

### Backend 2

1. Create `POST /operations/wash-sessions`
2. Create `GET /operations/queue`
3. Create `POST /operations/wash-sessions/:id/check-in`
4. Expose fee or projected points after check-in

### Fullstack 1

1. Complete booking list page
2. Complete booking detail page
3. Complete success state after create booking

### Fullstack 2

1. Wire staff operations board
2. Wire check-in page
3. Show queue status basic
4. Show fee or projected points after check-in

### Frontend

1. Standardize booking status badges
2. Standardize queue table/list visual
3. Support polish for customer booking flow

### End-of-day expected

- customer flow demos end-to-end
- staff sees queue and can check-in
- fee / projected points visible after check-in

---

## 2026-05-28

### Daily goal

- complete start/complete wash
- wire loyalty, promotion, and admin visibility basics

### Backend 1

1. Support booking status sync with operation flow
2. Fix booking/admin payload mismatch
3. Finalize voucher validate basic

### Backend 2

1. Create `POST /operations/wash-sessions/:id/start`
2. Create `POST /operations/wash-sessions/:id/complete`
3. Add loyalty earn logic on complete
4. Add promotion targeting basics:
   - all tiers
   - tier group
5. Add admin point transaction history basic
6. Expose Swagger for operations + loyalty + promotion basics

### Fullstack 1

1. Sync booking badges/status with operations changes
2. Show earned points after complete
3. Prepare customer loyalty history basic
4. Prepare promotions list basic

### Fullstack 2

1. Wire start wash action
2. Wire complete wash action
3. Sync admin bookings with new status
4. Add admin customer point history basic

### Frontend

1. Standardize staff action button states
2. Standardize status color/state mapping on customer/staff/admin
3. Support last-mile UI bug fixing

### End-of-day expected

- staff can complete wash
- admin sees booking status changes
- customer sees earned points
- admin sees point history basic

---

## 2026-05-29

### Daily goal

- fix bugs
- stabilize demo
- close foundation review

### Backend 1

1. Fix auth/profile/vehicle/booking bugs
2. Test full customer flow via Postman/Swagger
3. Standardize sample data for demo

### Backend 2

1. Fix operations/loyalty/admin bugs
2. Test staff/admin flow via Postman/Swagger
3. Standardize sample booking/session/promotion data

### Fullstack 1

1. Retest:
   - register
   - login
   - profile
   - vehicles
   - create booking
   - booking list/detail
   - loyalty basics
   - promotions list
2. Fix final UX loading/error states

### Fullstack 2

1. Retest:
   - staff login
   - queue
   - check-in
   - start
   - complete
   - admin dashboard
   - admin bookings/customers
   - customer point history basic
2. Fix final UI/data issues

### Frontend

1. Polish UI consistency for demo
2. Fix form/layout/state visual bugs
3. Prepare demo script and clean display data

### End-of-day expected

- whole foundation demo runs
- Swagger available for priority APIs
- clear demo script exists
- no dependency on business mocks for selected main flows

---

## Suggested demo script

1. Register new customer
2. Verify OTP
3. Login customer
4. Open profile
5. Add vehicle
6. Create booking
7. View booking list/detail
8. Login staff
9. Open queue
10. Check-in booking
11. Show fee / projected points
12. Start wash
13. Complete wash
14. Login admin
15. View dashboard
16. View all bookings
17. View customers/accounts
18. View point transaction history
19. View promotions basic

---

## Bug-fix priority if time is short

If by `2026-05-28` the team is still behind, keep:

1. Auth
2. Profile
3. Vehicle CRUD
4. Create booking
5. Booking list/detail
6. Staff queue/check-in/start/complete
7. Loyalty earn after complete
8. Admin bookings/customers basic
9. Promotion basics
10. Swagger

Reduce first:

- combo advanced behaviors
- complex voucher rules
- pretty dashboard metrics
- deep admin tabs beyond mandatory history
- notification polish

## Conclusion

Week `2026-05-23 -> 2026-05-29` should target only:

- `mandatory-first foundation demo`

Success means:

- customer flow works
- staff flow works
- admin basic oversight works
- loyalty / promotion basics are visible
- Swagger exists for the priority APIs
