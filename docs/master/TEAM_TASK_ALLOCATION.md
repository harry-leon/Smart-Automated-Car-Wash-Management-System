# AutoWash Pro - Team Task Allocation

## Mục tiêu phân chia

Tài liệu này chia việc cho:

- `3 Backend`
- `2 Fullstack`

theo bối cảnh hiện tại:

- prototype giao diện đã gần hoàn chỉnh
- trọng tâm không còn là dựng UI mới
- trọng tâm là xây backend thật và thay mock/local store bằng API thật

## Kết luận kỹ thuật sau khi đọc docs

### Điều đã rõ

- Dự án hiện tại vẫn là `frontend prototype`
- Có 2 state model đang tách rời:
  - shared portal store
  - module-local customer booking store
- MVP production cần giải quyết 2 việc song song:
  - backend Spring Boot + PostgreSQL theo modular monolith
  - frontend integration từ mock sang API, không làm lại UI từ đầu

### Rủi ro lớn nhất

Không phải CSS hay page layout, mà là:

- hợp nhất booking domain
- hợp nhất tier/loyalty
- đồng bộ flow customer → staff → admin
- thay simulation bằng persistence + RBAC + validation thật

## Nguyên tắc chia người

### Backend

Chia theo domain nghiệp vụ, không chia lẫn lộn endpoint lặt vặt.

### Fullstack

Chia theo workspace tích hợp:

- 1 người ôm `Customer Portal`
- 1 người ôm `Staff + Admin`

Fullstack chỉ sửa frontend ở mức:

- gọi API
- thay Zustand/local mock bằng server state
- sửa route/DTO/error handling
- hoàn thiện loading, empty, error, optimistic update

Không giao họ “vẽ lại UI”.

## Phân công đề xuất

## Backend 1 - Auth, User, Accounts Foundation

### Owner

`Backend A`

### Phạm vi chính

- Epic 1: `auth`
- Epic 2: `user`
- phần nền RBAC và account status
- một phần admin accounts foundation

### Task chính

1. Xây `auth` module
   - register
   - otp send/verify
   - login
   - refresh token
   - logout
   - forgot/reset password

2. Xây Spring Security + JWT + RBAC
   - role `CUSTOMER`
   - role `STAFF`
   - role `ADMIN`

3. Xây `user` module
   - get profile
   - update profile
   - preferences
   - status management

4. Chuẩn hóa response/error format
   - `ApiResponse`
   - validation error
   - business error
   - auth error

5. Tạo seed tài khoản cơ bản
   - admin demo
   - staff demo
   - customer demo

### Deliverables

- auth APIs chạy ổn định
- token refresh hoạt động
- protected endpoint hoạt động đúng role
- user/profile/preferences API hoàn chỉnh

### Dependency cho người khác

Đây là backend nền. Nếu chậm thì cả 2 fullstack đều bị chặn.

### Priority

`P0`

## Backend 2 - Vehicle, Booking, Promotion Catalog

### Owner

`Backend B`

### Phạm vi chính

- Epic 3: `vehicle`
- Epic 4: `booking`
- phần catalog của Epic 8: `packages`, `add-ons`, `combos`, `vouchers`, `promotion validation`

### Task chính

1. Xây `vehicle` module
   - create/list/detail/update/delete
   - set primary
   - validate plate uniqueness

2. Xây `booking` module
   - create booking
   - list bookings
   - booking detail
   - cancel booking
   - pay endpoint mock
   - validate voucher

3. Xây package/add-on/catalog APIs
   - public package list
   - add-on list theo package
   - combo available
   - voucher available

4. Xây rule booking production
   - max 3 active bookings
   - no duplicate slot
   - validate date/time
   - booking status lifecycle phía customer

5. Xử lý production gap lớn nhất của prototype
   - thống nhất source of truth cho booking
   - không để customer booking chạy mock riêng nữa

### Deliverables

- customer có thể dùng API thật để:
  - quản lý xe
  - đặt lịch
  - xem booking
  - validate voucher
- backend catalog đủ cho checkout flow 7 bước

### Dependency cho người khác

`Fullstack A` phụ thuộc trực tiếp gần như toàn bộ phần này.

### Priority

`P0`

## Backend 3 - Operations, Loyalty, Notifications, Admin Reporting

### Owner

`Backend C`

### Phạm vi chính

- Epic 5: `operation`
- Epic 6: `staff management`
- Epic 7: `loyalty`
- Epic 9: `admin dashboard/reporting/accounts queries`
- Epic 10: `notification`

### Task chính

1. Xây `operation` module
   - create wash session
   - queue
   - check-in
   - start wash
   - complete wash
   - staff assignment workload

2. Xây `loyalty` module
   - loyalty account
   - earn points
   - redeem voucher
   - transaction history
   - expiring warning data
   - tier logic

3. Xây `notification` module
   - notification center
   - mark read
   - booking reminder records
   - websocket events cơ bản

4. Xây admin metrics/reporting/query APIs
   - dashboard metrics
   - admin bookings
   - admin accounts/customers
   - reports

5. Giải quyết 2 điểm production quan trọng
   - loyalty tier unification
   - booking → wash session → points lifecycle thật

### Deliverables

- staff có queue thật
- admin có metrics thật
- customer thấy loyalty/notification từ backend

### Dependency cho người khác

`Fullstack B` phụ thuộc trực tiếp phần này.

### Priority

`P0`

## Fullstack 1 - Customer Portal Integration

### Owner

`Fullstack A`

### Phạm vi chính

- toàn bộ `Customer Portal`
- không thiết kế lại UI
- thay prototype/local state bằng API thật

### Task chính

1. Dựng frontend app foundation đúng chuẩn production
   - `api.ts`
   - axios interceptor
   - auth store
   - React Query setup
   - route guard

2. Tích hợp auth customer
   - login
   - register
   - verify
   - forgot password

3. Tích hợp customer profile/settings
   - get/update profile
   - preferences

4. Tích hợp vehicle flow
   - list/add/detail/edit/delete/set primary

5. Tích hợp booking checkout flow 7 bước
   - package/combo
   - add-ons
   - date/time
   - voucher validation
   - payment selection
   - confirm booking

6. Tích hợp customer post-booking pages
   - booking list/detail
   - loyalty account
   - loyalty redeem/history
   - notifications
   - promotions/vouchers/combos

7. Loại bỏ dependency vào module-local booking mock state

### Deliverables

- customer portal chạy bằng API thật
- local mock logic được gỡ hoặc cô lập
- chỉ giữ local state cho UI tạm thời, không giữ business state

### Priority

`P0`

## Fullstack 2 - Staff/Admin Integration + Shared Production Glue

### Owner

`Fullstack B`

### Phạm vi chính

- `Staff workspace`
- `Admin workspace`
- shared infra cho websocket, notifications, table/filter state

### Task chính

1. Tích hợp staff auth và navigation

2. Tích hợp staff operations
   - operations board
   - check-in
   - session detail
   - start/complete wash

3. Tích hợp admin dashboard
   - metrics
   - bookings list/detail
   - assign staff
   - accounts/customers list
   - customer detail tabs
   - reports

4. Tích hợp admin master data pages
   - staff
   - packages
   - add-ons
   - combos
   - promotions
   - vouchers

5. Tích hợp notification center / websocket hooks dùng chung

6. Chuẩn hóa route thực tế theo prototype hiện tại
   - ưu tiên `/staff/*` nếu code prototype đang dùng vậy
   - không để docs và code chạy lệch prefix

### Deliverables

- staff/admin không còn phụ thuộc local store cho nghiệp vụ chính
- pages dùng API + query cache + mutation thật

### Priority

`P0`

## Không nên giao ngay ở giai đoạn đầu

Các phần sau nên để sau MVP hoặc chỉ mock nhẹ:

- support chat đầy đủ
- live wash tracker realtime hoàn chỉnh
- payment gateway thật
- SMS/email gateway thật
- export CSV/PDF
- retrospective/reporting nâng cao

## Kế hoạch triển khai theo phase

## Phase 1 - Foundation

### Backend

- Backend 1:
  - auth
  - jwt
  - rbac
  - profile/preferences

- Backend 2:
  - vehicle CRUD
  - package/add-on public list
  - booking entity skeleton

- Backend 3:
  - staff entity
  - wash session entity skeleton
  - loyalty account skeleton

### Fullstack

- Fullstack 1:
  - app shell customer
  - auth integration
  - query + axios + error handling

- Fullstack 2:
  - app shell staff/admin
  - auth integration
  - shared table/filter infrastructure

## Phase 2 - Customer Booking MVP

- Backend 2 hoàn tất booking flow
- Fullstack 1 tích hợp full customer booking
- Backend 1 hỗ trợ auth edge cases

Kết quả phase này:

- customer đăng ký
- đăng nhập
- quản lý xe
- đặt lịch được bằng API thật

## Phase 3 - Staff/Admin MVP

- Backend 3 hoàn tất operations + loyalty posting + metrics
- Fullstack 2 tích hợp staff/admin pages
- Backend 2 hỗ trợ booking/session linkage

Kết quả phase này:

- staff check-in/start/complete được
- admin nhìn booking, account, metrics được

## Phase 4 - Consolidation

- Backend 2 + Backend 3:
  - unify booking state
  - unify tier system

- Fullstack 1 + Fullstack 2:
  - bỏ hẳn mock/local business state còn sót
  - fix mismatch customer/staff/admin

## Task giao riêng cho từng nhóm

## Backend A

### Must-have

- Auth module
- JWT/RBAC
- User/Profile/Preferences
- Account status update

### Nice-to-have sau MVP

- forgot password polish
- audit hooks cho auth/user

## Backend B

### Must-have

- Vehicle CRUD
- Booking CRUD + cancel + detail
- Voucher validation
- Package/Add-on/Combo/Voucher list APIs

### Nice-to-have sau MVP

- advanced booking constraints
- combo activation refinement

## Backend C

### Must-have

- Wash session lifecycle
- Staff workload/assignment
- Loyalty earning/redeem/history
- Admin dashboard metrics
- Notification center APIs

### Nice-to-have sau MVP

- reminder scheduler hoàn chỉnh
- report aggregation tối ưu

## Fullstack A

### Must-have

- customer auth pages
- customer profile/settings
- vehicles
- bookings new/list/detail
- loyalty pages
- notifications page

### Nice-to-have sau MVP

- promotions/vouchers polishing
- combo UX refinement

## Fullstack B

### Must-have

- staff operations pages
- admin dashboard/bookings/accounts
- admin package/promotion CRUD pages
- shared websocket wiring

### Nice-to-have sau MVP

- report filters polish
- advanced admin interactions

## Chỗ nào cần phối hợp nhiều nhất

### Backend A <-> Fullstack A/B

- login response shape
- refresh token flow
- role routing

### Backend B <-> Fullstack A

- checkout DTO
- booking detail DTO
- voucher validation payload

### Backend C <-> Fullstack B

- operations queue DTO
- wash session lifecycle transitions
- dashboard/report payload

### Backend B <-> Backend C

- booking completion → loyalty posting
- booking status ↔ wash session status

## Definition of Done cho từng loại task

### Backend task hoàn thành khi

- endpoint chạy được
- validate business rule chính
- response đúng contract
- test được bằng Postman/Swagger
- không trả dữ liệu lệch với docs

### Fullstack task hoàn thành khi

- page không còn đọc mock business data
- gọi API thật
- loading/error/empty state hoạt động
- mutation có success/failure handling
- role guard và redirect đúng

## Khuyến nghị giao việc trên GitHub Project

### Workspace cho project items

- `Backend`
- `Customer`
- `Operations`
- `Admin`
- `Shared`

### Assignee mapping gợi ý

- `Backend A`:
  - Auth
  - User
  - Shared security

- `Backend B`:
  - Vehicle
  - Booking
  - Promotion catalog

- `Backend C`:
  - Operations
  - Loyalty
  - Notification
  - Reports

- `Fullstack A`:
  - Customer

- `Fullstack B`:
  - Operations
  - Admin

## Kết luận

Nếu anh muốn tiến độ thực dụng nhất cho đội hiện tại, hãy xem đây là mục tiêu:

1. `3 backend` chia theo domain ổn định, không dẫm chân nhau
2. `2 fullstack` chia theo workspace tích hợp, không vẽ lại UI
3. MVP đầu tiên phải ra được:
   - customer đặt lịch thật
   - staff xử lý wash session thật
   - admin xem và quản lý thật

Phần còn lại như support chat, live tracking nâng cao, payment gateway thật nên để sau khi booking lifecycle và loyalty lifecycle đã chạy end-to-end.

---

## Revised Allocation - 2 Backend, 2 Fullstack, 1 Frontend

## Bối cảnh mới

Đây là cách chia phù hợp hơn nếu team thực tế là:

- `2 Backend`
- `2 Fullstack`
- `1 Frontend`

và người `Frontend` chỉ nên tập trung giai đoạn đầu vào:

- chuẩn hóa app shell
- cleanup prototype
- hỗ trợ integration UI

sau đó có thể được đẩy dần sang làm backend hoặc hỗ trợ fullstack/backend tùy tiến độ.

## Nguyên tắc chia mới

### 2 Backend

Không chia theo màn hình. Chia theo cụm domain:

- `Backend 1`: nền tảng + customer transaction core
- `Backend 2`: operations + loyalty + admin/governance

### 2 Fullstack

Chia theo workspace tích hợp:

- `Fullstack 1`: Customer
- `Fullstack 2`: Staff + Admin

### 1 Frontend

Không giao business logic lớn. Giao:

- chuyển UI prototype sang frontend production structure
- shared components/layout/hooks
- hỗ trợ 2 fullstack tháo mock state khỏi UI

Sau phase đầu, người này có thể chuyển qua:

- hỗ trợ backend docs/test/Postman
- hoặc nhận module backend nhẹ như notification/support

## Phân công đề xuất mới

## Backend 1 - Auth, User, Vehicle, Booking Core

### Owner

`Backend 1`

### Phạm vi

- `auth`
- `user`
- `vehicle`
- `booking`
- phần catalog cần trực tiếp cho checkout

### Task đầu

1. Auth
   - register
   - otp send/verify
   - login
   - refresh
   - logout
   - forgot/reset password

2. Security foundation
   - JWT
   - Spring Security
   - RBAC
   - common error/response wrapper

3. User/Profile
   - get profile
   - update profile
   - preferences

4. Vehicle
   - CRUD
   - set primary

5. Booking core
   - create booking
   - booking detail
   - booking list
   - cancel booking
   - voucher validate

6. Checkout catalog tối thiểu
   - packages list
   - add-ons list
   - combos available
   - vouchers available

### Vì sao gom như vậy

Đây là toàn bộ xương sống để customer flow chạy được end-to-end.

## Backend 2 - Operations, Loyalty, Admin, Notification

### Owner

`Backend 2`

### Phạm vi

- `operation`
- `loyalty`
- `notification`
- `admin`
- reporting
- staff management

### Task đầu

1. Operations
   - create wash session
   - queue
   - check-in
   - start
   - complete
   - staff workload

2. Staff management
   - create/list/update status staff

3. Loyalty
   - loyalty account
   - earn points on completion
   - redeem points
   - loyalty history
   - expiring warnings

4. Admin
   - dashboard metrics
   - admin bookings
   - admin accounts/customers
   - customer detail tabs
   - reports

5. Notifications
   - notification center
   - mark read
   - reminder records
   - websocket event contracts

### Vì sao gom như vậy

Đây là cụm domain vận hành nội bộ và hậu xử lý sau booking, ít phụ thuộc UI customer hơn.

## Fullstack 1 - Customer Portal Integration

### Owner

`Fullstack 1`

### Phạm vi

- toàn bộ customer portal

### Task đầu

1. Setup frontend production data layer cho customer
   - `api.ts`
   - axios interceptor
   - auth store
   - React Query hooks

2. Auth pages
   - login
   - register
   - verify
   - forgot password

3. Profile/settings

4. Vehicles integration

5. Booking checkout flow 7 bước

6. Booking list/detail

7. Loyalty pages

8. Notifications page

### Mục tiêu

Biến customer prototype thành customer app chạy API thật.

## Fullstack 2 - Staff/Admin Integration

### Owner

`Fullstack 2`

### Phạm vi

- staff workspace
- admin workspace

### Task đầu

1. Staff auth + routing

2. Staff operations
   - operations board
   - check-in
   - session detail
   - start/complete wash

3. Admin dashboard

4. Admin bookings + assign staff

5. Admin accounts/customers

6. Admin master data pages
   - packages
   - add-ons
   - promotions
   - vouchers
   - combos
   - staff

7. Reports + notifications wiring dùng chung

### Mục tiêu

Biến staff/admin prototype thành công cụ vận hành thật.

## Frontend - Prototype Cleanup, Shared UI, Integration Support

### Owner

`Frontend`

### Vai trò đúng

Người này không nên ôm business backend ngay từ đầu. Vai trò tốt nhất giai đoạn 1 là:

- dọn cấu trúc frontend
- chuẩn hóa component dùng chung
- hỗ trợ 2 fullstack bỏ mock state

### Task đầu

1. Dựng khung frontend chuẩn
   - app layouts
   - shared UI primitives
   - sidebar/topbar/breadcrumb
   - route guard presentation layer

2. Chuẩn hóa constants/types/validators phía frontend

3. Cleanup prototype routes
   - thống nhất prefix thực tế
   - bỏ chỗ duplicate UI
   - tách component customer/staff/admin cho rõ

4. Chuẩn hóa loading/error/empty/skeleton states

5. Hỗ trợ Fullstack 1 và 2
   - convert page mock thành page chờ API
   - form wiring
   - display DTO mapping

6. Viết shared hooks không chứa business logic backend nặng
   - table filters
   - pagination UI state
   - modal patterns

### Không nên giao ban đầu

- thiết kế loyalty logic
- booking business rules
- operations state machine
- reporting logic

## Khi nào đẩy người Frontend sang Backend

Chỉ nên làm sau khi 3 việc này đã xong:

1. customer pages đã nối được skeleton API
2. staff/admin pages không còn lệ thuộc mock UI nặng
3. shared component/layout/store frontend đã ổn

## Công việc backend phù hợp để chuyển sau

### Ưu tiên chuyển sang hỗ trợ

- notification module đơn giản
- support chat persistence mức basic
- viết DTO/mapper
- viết API docs / Postman collection
- test endpoint / QA integration

### Không nên chuyển ngay sang

- auth/security
- booking core
- loyalty calculation
- operations lifecycle

## Kế hoạch theo phase

## Phase 1 - Ổn định nền tảng

### Backend 1

- auth
- jwt/rbac
- profile

### Backend 2

- operation skeleton
- loyalty/account skeleton
- admin metrics skeleton

### Fullstack 1

- customer auth
- customer app shell

### Fullstack 2

- staff/admin app shell

### Frontend

- shared components
- layout cleanup
- constants/validators/types UI side

## Phase 2 - Customer MVP

### Backend 1

- vehicle
- booking core
- package/add-on/catalog

### Fullstack 1

- vehicles
- bookings
- loyalty basic screens integration

### Frontend

- support page integration cleanup
- form polish
- empty/loading/error states

## Phase 3 - Operations/Admin MVP

### Backend 2

- queue
- check-in/start/complete
- loyalty posting
- admin bookings/accounts/reports

### Fullstack 2

- operations pages
- admin dashboard
- admin booking/accounts pages

### Frontend

- shared admin/staff table polish
- chart/table presentation cleanup

## Phase 4 - Frontend chuyển dần sang backend support

Sau khi phase 1-3 ổn, người `Frontend` có thể chuyển dần qua:

- notification APIs đơn giản
- support thread/message basic
- QA integration
- API contract sync

## Giao task thực dụng cho từng người

## Backend 1

- `P0` Auth + JWT + RBAC
- `P0` User/Profile/Preferences
- `P0` Vehicle CRUD
- `P0` Booking CRUD + voucher validate
- `P1` Checkout catalog APIs

## Backend 2

- `P0` Wash session lifecycle
- `P0` Staff management
- `P0` Loyalty earn/redeem/history
- `P0` Admin dashboard/bookings/accounts
- `P1` Notifications/reports

## Fullstack 1

- `P0` Customer auth integration
- `P0` Vehicles integration
- `P0` Booking checkout integration
- `P1` Loyalty/notifications/promotions pages

## Fullstack 2

- `P0` Staff operations integration
- `P0` Admin dashboard/bookings/accounts integration
- `P1` Master data CRUD pages

## Frontend

- `P0` Shared UI/layout cleanup
- `P0` Standardize constants/validators/display states
- `P0` Support both fullstack on page-level integration polish
- `P1` Later move to backend-support tasks

## Kết luận mới

Với team hiện tại, mô hình tốt nhất là:

1. `2 backend` ôm domain thật
2. `2 fullstack` ôm workspace integration
3. `1 frontend` ôm cleanup + shared UI + integration support trước
4. sau đó mới đẩy người frontend sang backend-support/task nhẹ

Đây là cách ít nghẽn nhất vì:

- backend core vẫn nằm trong tay người backend
- fullstack không bị chờ UI cleanup
- frontend không bị ném ngay vào business logic nặng không đúng thế mạnh
