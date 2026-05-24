# AutoWash Pro - Team Task Allocation

## Muc tieu

Tai lieu nay chia viec theo dung mandatory-first scope trong `Project.md`.

Team hien tai:

- `BE1`: Huy
- `BE2`: Thuận
- `FS1`: Hùng
- `FS2`: Hưng
- `FE`: Khương

## Nguyen tac

1. Khong chia lan nhieu domain trong cung 1 nguoi neu co the tranh duoc.
2. Backend lo business logic va contract.
3. Fullstack lo workspace integration, khong ve lai UI.
4. Frontend lo shared UI, layout, validators, cleanup prototype, khong om business logic nang.

## Mandatory-first scope can xong truoc

1. Dang ky, dang nhap, OTP, refresh, logout, RBAC
2. CRUD xe
3. Package/add-on/combo/voucher catalog
4. Booking create/list/detail/cancel/validate voucher
5. Operation queue, check-in, start, complete
6. Loyalty earn/redeem/history, tier upgrade
7. Promotions CRUD
8. Member history pages
9. Admin bookings, customer detail, transaction history
10. Swagger/OpenAPI tu dau

## GitHub Project format

Moi task tren GitHub Project nen dung dung cac field sau:

- `Title`: ten task ngan gon, dung action verb.
- `Status`: Backlog, Ready, In progress, In review, Done.
- `Priority`: P0 cho mandatory-first scope.
- `Start Date`: ngay bat dau task.
- `Target Date`: deadline task.
- `Workspace`: Backend, Customer, Operations, Admin, Shared.
- `Epic`: nhom domain trong Project.md.
- `Owner`: mot nguoi chiu trach nhiem chinh.
- `Dependencies`: ghi ro ai phai xong task nao truoc khi task nay co the finish.

## Daily allocation 24/05/2026 - 29/05/2026

| Ngay | Owner | Project task | Ket qua can co | Dependencies |
|---|---|---|---|---|
| 24/05/2026 | Huy | Setup Spring Boot backend skeleton | Backend skeleton, PostgreSQL config, Swagger/OpenAPI base | Khong co |
| 24/05/2026 | Khương | Setup Next.js frontend skeleton | Next.js 14 App Router base tu prototype, customer/staff/admin route groups | Khong co |
| 24/05/2026 | Huy | Implement backend auth module endpoints | Auth contract va endpoint nen tang cho register/login/refresh | Huy phai xong: Setup Spring Boot backend skeleton |
| 24/05/2026 | Hùng | Build customer auth integration | Customer auth data layer va auth pages noi API/contract | Khương phai xong: Setup Next.js frontend skeleton; Huy phai xong: backend auth contract |
| 25/05/2026 | Huy | Implement backend user profile API | Profile/preferences API sau login | Huy phai xong: Implement backend auth module endpoints |
| 25/05/2026 | Hùng | Build customer profile page integration | Profile page doc/update API that | Huy phai xong: profile API; Hùng phai xong: customer auth integration; Khương phai giu route/layout on dinh |
| 25/05/2026 | Huy | Implement backend vehicle CRUD APIs | CRUD xe va set-primary API | Huy phai xong: backend auth module endpoints |
| 25/05/2026 | Hùng | Build customer vehicle CRUD pages | Vehicle list/add/edit/delete/set-primary dung prototype UI | Huy phai xong: vehicle API; Hùng phai xong: auth integration; Khương phai xong: frontend base |
| 26/05/2026 | Huy | Implement backend booking APIs | Catalog, booking create/list/detail/cancel, voucher validate, status model | Huy phai xong: auth va vehicle APIs |
| 26/05/2026 | Hùng | Build customer booking checkout flow | Booking checkout 7 buoc noi API that | Huy phai xong: booking API; Hùng phai xong: vehicle CRUD pages; Khương phai giu UI shell on dinh |
| 27/05/2026 | Thuận | Implement backend operations lifecycle APIs | Queue, check-in, start, complete, sync booking status | Huy phai xong: booking API |
| 27/05/2026 | Hưng | Build staff operations queue and session flow | Staff queue va session actions noi API that | Thuận phai xong: operations API; Khương phai xong: frontend base |
| 28/05/2026 | Thuận | Implement backend loyalty APIs | Earn/history/account/tier upgrade sau complete wash | Thuận phai xong: operations API; Huy phai xong: booking API |
| 28/05/2026 | Hùng | Build customer history, loyalty, and promotions pages | Member xem booking history, wash history, point history, tier va promotions tu API that | Thuận phai xong: loyalty API va promotions API; Hùng phai xong: booking checkout flow |
| 28/05/2026 | Thuận | Implement backend promotions CRUD | Promotion CRUD, target all tiers/selected tiers | Thuận phai xong: loyalty model/API |
| 28/05/2026 | Hưng | Build admin promotions management pages | Admin promotion list/create/edit/delete | Thuận phai xong: promotions API; Khương phai xong: admin route shell |
| 28/05/2026 | Thuận | Implement backend admin bookings and customer history APIs | All bookings, customer detail, wash history, point transaction history | Huy phai xong: booking API; Thuận phai xong: operations va loyalty APIs |
| 28/05/2026 | Hưng | Build admin bookings and customer history pages | Admin bookings va customer history dung API that | Thuận phai xong: admin APIs; Hưng phai xong: staff operations flow |
| 29/05/2026 | Khương | Run foundation demo QA pass | Demo register -> vehicle -> booking -> operations -> loyalty -> admin oversight | Huy, Thuận, Hùng, Hưng, Khương phai xong cac task P0 lien quan |

## Backend 1 - Huy - Auth, User, Vehicle, Booking Core

### Pham vi

- `auth`
- `user`
- `vehicle`
- `booking`
- public catalog cho checkout

### Must-have

1. Register, OTP send/verify, login, refresh, logout
2. JWT / Spring Security / RBAC
3. Profile, preferences
4. Vehicle CRUD + set primary
5. Booking core + voucher validate
6. Package, add-on, combo, voucher list APIs
7. Swagger/OpenAPI cho auth, profile, vehicle, booking

### Priority

`P0`

## Backend 2 - Thuận - Operations, Loyalty, Admin

### Pham vi

- `operation`
- `loyalty`
- `admin`
- reports
- staff management
- promotions

### Must-have

1. Wash session lifecycle
2. Staff queue and workload
3. Loyalty earn/redeem/history
4. Tier upgrade rules
5. Promotions CRUD
6. Admin bookings, accounts/customers, transaction history
7. Swagger/OpenAPI cho operations, loyalty, admin, promotions

### Priority

`P0`

## Fullstack 1 - Hùng - Customer Portal Integration

### Pham vi

- customer workspace

### Must-have

1. Frontend data layer
   - `api.ts`
   - interceptor
   - auth store
   - React Query
2. Auth pages
   - register
   - login
   - verify
   - forgot password
3. Vehicle pages
4. Booking checkout flow 7 buoc
5. Booking list/detail
6. Loyalty pages
7. Promotions / vouchers / combos pages

### Priority

`P0`

## Fullstack 2 - Hưng - Staff/Admin Integration

### Pham vi

- staff workspace
- admin workspace

### Must-have

1. Staff auth and routing
2. Operations board, check-in, session detail, start/complete wash
3. Admin dashboard
4. Admin bookings
5. Admin accounts/customers
6. Admin promotions and vouchers CRUD pages
7. Customer detail tabs
8. Shared websocket/table/filter wiring

### Priority

`P0`

## Frontend - Khương - Shared UI, Cleanup, Integration Support

### Pham vi

- shared layout
- shared components
- cleanup prototype
- integration support cho 2 fullstack

### Must-have

1. Root/auth/customer/staff/admin layout cleanup
2. Shared components: button, input, modal, skeleton, empty state
3. Validators: phone, password, otp, email
4. Loading/error/empty state standardization
5. Route prefix cleanup theo `Project.md`
6. Loai bo mock business state phu hop tung phase

### Priority

`P0`

## Phase goi y

### Phase 1

- Backend 1: auth, user, vehicle, booking foundation
- Backend 2: operation skeleton, loyalty skeleton, admin skeleton
- Fullstack 1: customer auth + shell
- Fullstack 2: staff/admin shell
- Frontend: layout, components, validators

### Phase 2

- Backend 1: vehicle, booking core, catalog
- Fullstack 1: vehicles + booking checkout
- Frontend: forms, states, cleanup

### Phase 3

- Backend 2: operations, loyalty posting, admin basic
- Fullstack 2: staff/admin MVP

### Phase 4

- Backend 2: promotions, admin history, reports
- Fullstack 1: booking history, wash history, loyalty, promotions
- Fullstack 2: customer detail tabs, admin reports

## Definition of Done

### Backend done khi

- endpoint chay duoc
- validate dung business rule
- response dung contract
- co Swagger/OpenAPI

### Fullstack done khi

- page goi API that
- loading/error/empty state hoat dong
- role guard/redirect dung
- khong con business mock state cho phan da co backend
