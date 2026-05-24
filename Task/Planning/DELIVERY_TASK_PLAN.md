# AutoWash Pro - Delivery Task Plan

## Muc tieu

Tai lieu nay phai bam theo `Project.md`, voi thu tu uu tien:

1. `Auth -> Customer Core -> Operations -> Loyalty/Admin -> Consolidation -> Production Hardening`
2. MVP dau tien phai demo duoc:
   - dang ky, dang nhap, CRUD xe
   - booking lifecycle day du
   - check-in, start, complete
   - loyalty, promotion, tier upgrade
   - member history va admin oversight
3. Swagger/OpenAPI phai co tu dau cho cac API uu tien

## Mandatory-first scope

### 1. Account / Auth / Profile / Vehicle

- Dang ky tai khoan
- OTP verify
- Dang nhap
- JWT / RBAC
- Profile co ban
- CRUD xe
- Default tier sau dang ky = `MEMBER`

### 2. Customer Booking Core

- Package / add-on / combo list
- Voucher validate
- Tao booking
- Danh sach va chi tiet booking
- Huy booking
- Booking status:
  - `PENDING`
  - `CONFIRMED`
  - `CHECKED_IN`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
  - `NO_SHOW` neu backend da ho tro

### 3. Operations

- Tao wash session
- Queue
- Check-in
- Start wash
- Complete wash
- Hien thi phi / point lien quan sau check-in

### 4. Loyalty / Promotion / Tier

- Cong diem sau complete
- Ap dung promotion cho moi hang hoac theo nhom hang
- Upgrade tier khi du diem
- Loyalty account, redeem, history

### 5. Member / Admin Views

- Member:
  - booking history
  - wash history
  - point transactions
  - promotions list
- Admin:
  - all bookings
  - CRUD promotions
  - customer point transaction history
  - customer detail tabs

### 6. Swagger / API docs

- Moi API uu tien phai co contract ro rang
- Frontend phai test duoc qua Swagger/OpenAPI

---

## Phase 1 - Foundation Demo

### Muc tieu phase

- Dang ky
- Dang nhap
- Phan quyen
- Profile co ban
- Khung workspace customer/staff/admin

### Output demo

- Customer login duoc
- Staff login duoc
- Admin login duoc
- Redirect dung workspace
- Profile load duoc tu backend

### BE1

1. Tao Spring Boot project base + PostgreSQL connection
2. Tao auth module
3. Lam `POST /auth/register`
4. Lam `POST /auth/otp/send`
5. Lam `POST /auth/otp/verify`
6. Lam `POST /auth/login`
7. Lam `POST /auth/refresh`
8. Lam `POST /auth/logout`
9. Cau hinh JWT + Spring Security + RBAC
10. Lam `GET /users/profile`
11. Publish Swagger/OpenAPI ngay

### BE2

1. Tao base module structure cho:
   - operation
   - admin
   - loyalty
   - notification
2. Tao seed admin/staff accounts
3. Tao `GET /admin/dashboard/metrics` ban basic
4. Tao `GET /admin/accounts` hoac `GET /admin/customers` ban basic
5. Tao skeleton `GET /operations/queue`

### FS1

1. Setup frontend app data layer
   - axios
   - interceptor refresh token
   - auth store
   - query client
2. Tich hop:
   - register
   - verify OTP
   - login customer
3. Tich hop profile page customer
4. Tich hop logout flow customer

### FS2

1. Tich hop login cho staff/admin
2. Tich hop redirect theo role
3. Dung app shell staff/admin doc profile co ban
4. Ket noi admin dashboard basic metrics
5. Ket noi admin accounts/customers list basic

### FE

1. Chuan hoa shared layouts:
   - root layout
   - auth layout
   - customer layout
   - staff layout
   - admin layout
2. Chuan hoa shared components:
   - button
   - input
   - modal
   - skeleton
   - empty state
3. Chuan hoa validators:
   - phone
   - password
   - otp
   - email
4. Chuan hoa error/loading states cho auth/profile

---

## Phase 2 - Customer Core Demo

### Muc tieu phase

- Customer quan ly xe
- Customer xem package
- Customer dat lich
- Customer xem booking da tao

### Output demo

- Them xe duoc
- Xem danh sach xe duoc
- Tao booking duoc
- Xem booking list/detail duoc

### BE1

1. Lam `POST /customers/vehicles`
2. Lam `GET /customers/vehicles`
3. Lam `GET /customers/vehicles/:id`
4. Lam `PUT /customers/vehicles/:id`
5. Lam `DELETE /customers/vehicles/:id`
6. Lam `POST /customers/vehicles/:id/set-primary`
7. Lam `GET /packages`
8. Lam `GET /add-ons`
9. Lam `GET /combos/available`
10. Lam `GET /vouchers/available`
11. Lam `POST /bookings/validate-voucher`
12. Lam `POST /customers/bookings`
13. Lam `GET /customers/bookings`
14. Lam `GET /customers/bookings/:id`

### BE2

1. Tao booking read model co ban cho admin/staff dung chung
2. Tao `GET /admin/bookings` ban basic
3. Tao `GET /admin/bookings/:id` ban basic
4. Chuan bi wash session entity de phase sau noi booking -> operations

### FS1

1. Tich hop vehicles pages
   - list
   - add
   - detail/edit
   - set primary
2. Tich hop booking checkout flow 7 buoc
3. Tich hop voucher validate realtime
4. Tich hop bookings list
5. Tich hop booking detail

### FS2

1. Tich hop admin bookings list basic
2. Tich hop admin booking detail basic
3. Hien thi du lieu booking/customer dung contract

### FE

1. Cleanup toan bo customer forms
2. Chuan hoa checkout stepper UI
3. Chuan hoa vehicle cards / booking cards
4. Chuan hoa toast/error mapping cho vehicle + booking flow

---

## Phase 3 - Operations Core Demo

### Muc tieu phase

- Staff xu ly booking
- Check-in
- Start wash
- Complete wash
- Admin xem duoc trang thai van hanh

### Output demo

- Queue co du lieu
- Staff doi trang thai wash session duoc
- Admin thay booking thay doi trang thai

### BE1

1. Ho tro patch booking status theo operation flow
2. Chot booking detail payload cho staff/admin
3. Hoan thien rule cancel / duplicate / time validation neu con thieu

### BE2

1. Lam `POST /operations/wash-sessions`
2. Lam `GET /operations/queue`
3. Lam `POST /operations/wash-sessions/:id/check-in`
4. Lam `POST /operations/wash-sessions/:id/start`
5. Lam `POST /operations/wash-sessions/:id/complete`
6. Lam `GET /admin/operations/dashboard`
7. Lam `GET /admin/staff`
8. Lam `POST /admin/staff`
9. Lam `PUT /admin/staff/:id/status`

### FS1

1. Dong bo customer booking status badges
2. Hien thi booking detail theo trang thai moi tu operations

### FS2

1. Tich hop staff operations board
2. Tich hop check-in page
3. Tich hop session detail page
4. Tich hop start wash
5. Tich hop complete wash
6. Tich hop admin operations dashboard
7. Tich hop admin staff page basic

### FE

1. Chuan hoa board/session/check-in components
2. Chuan hoa trang thai mau sac booking/wash session
3. Toi uu loading/empty/error cho staff/admin tables

---

## Phase 4 - Loyalty, Notification, Admin Basic Production

### Muc tieu phase

- Loyalty that
- Notification center that
- Admin customer/account detail tot hon

### Output demo

- Complete wash xong co diem
- Customer xem loyalty balance/history
- Customer co notification center
- Admin xem chi tiet customer sau hon

### BE1

1. Ho tro booking/payment payload cho loyalty deduction neu can
2. Bo sung apply points/voucher integration points o booking flow

### BE2

1. Lam `GET /loyalty/account`
2. Lam `POST /loyalty/redeem-points`
3. Lam `GET /loyalty/transactions`
4. Tao loyalty earn on wash completion
5. Lam `GET /notifications`
6. Lam `PUT /notifications/:id/read`
7. Hoan thien `GET /admin/customers/:id`
8. Hoan thien 6 tab chi tiet customer
9. Hoan thien `GET /admin/reports/:reportType` ban basic

### FS1

1. Tich hop loyalty page
2. Tich hop loyalty redeem page
3. Tich hop loyalty history
4. Tich hop notifications page

### FS2

1. Tich hop admin customer detail tabs
2. Tich hop reports basic
3. Tich hop notification-related admin/staff views neu co

### FE

1. Chuan hoa loyalty widgets, history tables, notification list UI
2. Chuan hoa customer/admin data presentation

---

## Phase 5 - Production Consolidation

### Muc tieu phase

Chuyen tu demo chay duoc sang kien truc production sach hon.

### Output chinh

- Bo han business mock state
- Booking/state thong nhat
- Tier thong nhat
- Admin/staff/customer doc cung source of truth

### BE1

1. Hop nhat booking source of truth
2. Loai bo dependency vao customer module-local booking mock model
3. Hoan thien payment mock endpoint
4. Hoan thien advanced booking constraints

### BE2

1. Hop nhat loyalty tier system
2. Hoan thien loyalty expiry warnings
3. Hoan thien admin reporting aggregation
4. Audit logging basic cho booking/status/loyalty changes

### FS1

1. Go toan bo mock/local business state con sot o customer flow
2. Chuan hoa query/mutation invalidation
3. Hoan thien promotions/vouchers/combos customer pages

### FS2

1. Go mock/local business state staff/admin
2. Chuan hoa admin CRUD master data pages
3. Hoan thien assign staff / dashboard / reports flows

### FE

1. Refactor shared UI dung chung that su
2. Chuan hoa component contracts giua 3 workspace
3. Ho tro migration UI khoi prototype leftovers
4. Bat dau nhan backend-support task nhe:
   - DTO mapping review
   - notification/support basic endpoints
   - Postman / QA integration

---

## Phase 6 - Final Production Features

### Muc tieu phase

Tien gan san pham production cuoi:

- realtime
- support chat
- live tracking
- scheduler
- hardening

### BE1

1. Hardening auth/security
2. Validation edge cases
3. Refine booking/payment constraints

### BE2

1. WebSocket events:
   - `operations:queue:updated`
   - `booking:status:changed`
   - `notification:received`
   - `loyalty:points:updated`
2. Reminder scheduler
3. Support chat persistence basic
4. Live wash tracking backend snapshot

### FS1

1. Tich hop realtime cho customer notifications/status
2. Tich hop live wash tracker
3. Tich hop support chat basic neu bat

### FS2

1. Tich hop realtime operations board
2. Tich hop support inbox staff/admin basic

### FE

1. Polish UX cuoi
2. Responsive cleanup
3. Accessibility/basic design consistency

---

## Task uu tien tuyet doi truoc moi thu khac

1. Register
2. OTP verify
3. Login
4. JWT/RBAC
5. Profile
6. Vehicle CRUD basic
7. Package list
8. Create booking
9. Booking list/detail
10. Staff queue/check-in/start/complete
11. Admin bookings/customers basic
12. Loyalty earn/redeem/history
13. Promotions CRUD
14. Swagger/OpenAPI

