# AutoWash Pro - Delivery Task Plan

## Mục tiêu

Tài liệu này chia task từ:

- `giai đoạn tính năng nền tảng để giáo viên kiểm tra`

đến:

- `giai đoạn hoàn thiện production`

cho team:

- `BE1`
- `BE2`
- `FS1`
- `FS2`
- `FE`

## Nguyên tắc chia task

1. Giai đoạn đầu chia theo `core flow demo được`
2. Giai đoạn sau mới mở rộng sang `domain hoàn chỉnh`
3. Không giao theo cục domain quá to trong một lần
4. Mỗi phase phải có output demo rõ ràng

---

## Phase 1 - Foundation Demo

## Mục tiêu phase

Giáo viên có thể kiểm tra:

- đăng ký
- đăng nhập
- phân quyền
- profile cơ bản
- khung workspace customer/staff/admin

## Output demo

- customer login được
- staff login được
- admin login được
- redirect đúng workspace
- profile load được từ backend

## BE1

1. Tạo Spring Boot project base + PostgreSQL connection
2. Tạo auth module
3. Làm `POST /auth/register`
4. Làm `POST /auth/otp/send`
5. Làm `POST /auth/otp/verify`
6. Làm `POST /auth/login`
7. Làm `POST /auth/refresh`
8. Làm `POST /auth/logout`
9. Cấu hình JWT + Spring Security + RBAC
10. Làm `GET /users/profile`

## BE2

1. Tạo base module structure cho:
   - operation
   - admin
   - loyalty
   - notification
2. Tạo seed admin/staff accounts
3. Tạo `GET /admin/dashboard/metrics` bản basic
4. Tạo `GET /admin/accounts` hoặc `GET /admin/customers` bản basic
5. Tạo skeleton `GET /operations/queue`

## FS1

1. Setup frontend app data layer
   - axios
   - interceptor refresh token
   - auth store
   - query client
2. Tích hợp:
   - register
   - verify OTP
   - login customer
3. Tích hợp profile page customer
4. Tích hợp logout flow customer

## FS2

1. Tích hợp login cho staff/admin
2. Tích hợp redirect theo role
3. Dựng app shell staff/admin đọc profile cơ bản
4. Kết nối admin dashboard basic metrics
5. Kết nối admin accounts/customers list basic

## FE

1. Chuẩn hóa shared layouts:
   - root layout
   - auth layout
   - customer layout
   - staff layout
   - admin layout
2. Chuẩn hóa shared components:
   - button
   - input
   - modal
   - skeleton
   - empty state
3. Chuẩn hóa validators:
   - phone
   - password
   - otp
   - email
4. Chuẩn hóa error/loading states cho auth/profile

---

## Phase 2 - Customer Core Demo

## Mục tiêu phase

Giáo viên có thể kiểm tra:

- customer quản lý xe
- customer xem package
- customer đặt lịch
- customer xem booking đã tạo

## Output demo

- thêm xe được
- xem danh sách xe được
- tạo booking được
- xem booking list/detail được

## BE1

1. Làm `POST /customers/vehicles`
2. Làm `GET /customers/vehicles`
3. Làm `GET /customers/vehicles/:id`
4. Làm `PUT /customers/vehicles/:id`
5. Làm `DELETE /customers/vehicles/:id`
6. Làm `POST /customers/vehicles/:id/set-primary`
7. Làm `GET /packages`
8. Làm `GET /add-ons`
9. Làm `GET /combos/available`
10. Làm `GET /vouchers/available`
11. Làm `POST /bookings/validate-voucher`
12. Làm `POST /customers/bookings`
13. Làm `GET /customers/bookings`
14. Làm `GET /customers/bookings/:id`

## BE2

1. Tạo booking read model cơ bản cho admin/staff dùng chung
2. Tạo `GET /admin/bookings` bản basic
3. Tạo `GET /admin/bookings/:id` bản basic
4. Chuẩn bị wash session entity để phase sau nối booking → operations

## FS1

1. Tích hợp vehicles pages
   - list
   - add
   - detail/edit
   - set primary
2. Tích hợp booking checkout flow 7 bước
3. Tích hợp voucher validate realtime
4. Tích hợp bookings list
5. Tích hợp booking detail

## FS2

1. Tích hợp admin bookings list basic
2. Tích hợp admin booking detail basic
3. Hiển thị dữ liệu booking/customer đúng contract

## FE

1. Cleanup toàn bộ customer forms
2. Chuẩn hóa checkout stepper UI
3. Chuẩn hóa vehicle cards / booking cards
4. Chuẩn hóa toast/error mapping cho vehicle + booking flow

---

## Phase 3 - Operations Core Demo

## Mục tiêu phase

Giáo viên có thể kiểm tra:

- staff xử lý booking
- check-in
- start wash
- complete wash
- admin xem được trạng thái vận hành

## Output demo

- queue có dữ liệu
- staff đổi trạng thái wash session được
- admin thấy booking thay đổi trạng thái

## BE1

1. Hỗ trợ patch booking status theo operation flow
2. Chốt booking detail payload cho staff/admin
3. Hoàn thiện rule cancel / duplicate / time validation nếu còn thiếu

## BE2

1. Làm `POST /operations/wash-sessions`
2. Làm `GET /operations/queue`
3. Làm `POST /operations/wash-sessions/:id/check-in`
4. Làm `POST /operations/wash-sessions/:id/start`
5. Làm `POST /operations/wash-sessions/:id/complete`
6. Làm `GET /admin/operations/dashboard`
7. Làm `GET /admin/staff`
8. Làm `POST /admin/staff`
9. Làm `PUT /admin/staff/:id/status`

## FS1

1. Đồng bộ customer booking status badges
2. Hiển thị booking detail theo trạng thái mới từ operations

## FS2

1. Tích hợp staff operations board
2. Tích hợp check-in page
3. Tích hợp session detail page
4. Tích hợp start wash
5. Tích hợp complete wash
6. Tích hợp admin operations dashboard
7. Tích hợp admin staff page basic

## FE

1. Chuẩn hóa board/session/check-in components
2. Chuẩn hóa trạng thái màu sắc booking/wash session
3. Tối ưu loading/empty/error cho staff/admin tables

---

## Phase 4 - Loyalty, Notification, Admin Basic Production

## Mục tiêu phase

Hệ thống không chỉ chạy flow booking mà còn có:

- loyalty thật
- notification center thật
- admin customer/account detail tốt hơn

## Output demo

- complete wash xong có điểm
- customer xem loyalty balance/history
- customer có notification center
- admin xem chi tiết customer sâu hơn

## BE1

1. Hỗ trợ booking/payment payload cho loyalty deduction nếu cần
2. Bổ sung apply points/voucher integration points ở booking flow

## BE2

1. Làm `GET /loyalty/account`
2. Làm `POST /loyalty/redeem-points`
3. Làm `GET /loyalty/transactions`
4. Tạo loyalty earn on wash completion
5. Làm `GET /notifications`
6. Làm `PUT /notifications/:id/read`
7. Hoàn thiện `GET /admin/customers/:id`
8. Hoàn thiện 6 tab chi tiết customer
9. Hoàn thiện `GET /admin/reports/:reportType` bản basic

## FS1

1. Tích hợp loyalty page
2. Tích hợp loyalty redeem page
3. Tích hợp loyalty history
4. Tích hợp notifications page

## FS2

1. Tích hợp admin customer detail tabs
2. Tích hợp reports basic
3. Tích hợp notification-related admin/staff views nếu có

## FE

1. Chuẩn hóa loyalty widgets, history tables, notification list UI
2. Chuẩn hóa customer/admin data presentation

---

## Phase 5 - Production Consolidation

## Mục tiêu phase

Chuyển từ “demo chạy được” sang “kiến trúc production sạch hơn”.

## Output chính

- bỏ hẳn business mock state
- booking/state thống nhất
- tier thống nhất
- admin/staff/customer đọc cùng source of truth

## BE1

1. Hợp nhất booking source of truth
2. Loại bỏ dependency vào customer module-local booking mock model
3. Hoàn thiện payment mock endpoint
4. Hoàn thiện advanced booking constraints

## BE2

1. Hợp nhất loyalty tier system
2. Hoàn thiện loyalty expiry warnings
3. Hoàn thiện admin reporting aggregation
4. Audit logging basic cho booking/status/loyalty changes

## FS1

1. Gỡ toàn bộ mock/local business state còn sót ở customer flow
2. Chuẩn hóa query/mutation invalidation
3. Hoàn thiện promotions/vouchers/combos customer pages

## FS2

1. Gỡ mock/local business state staff/admin
2. Chuẩn hóa admin CRUD master data pages
3. Hoàn thiện assign staff / dashboard / reports flows

## FE

1. Refactor shared UI dùng chung thật sự
2. Chuẩn hóa component contracts giữa 3 workspace
3. Hỗ trợ migration UI khỏi prototype leftovers
4. Bắt đầu nhận backend-support task nhẹ:
   - DTO mapping review
   - notification/support basic endpoints
   - Postman / QA integration

---

## Phase 6 - Final Production Features

## Mục tiêu phase

Tiến gần sản phẩm production cuối:

- realtime
- support chat
- live tracking
- scheduler
- hardening

## BE1

1. Hardening auth/security
2. Validation edge cases
3. Refine booking/payment constraints

## BE2

1. WebSocket events:
   - operations:queue:updated
   - booking:status:changed
   - notification:received
   - loyalty:points:updated
2. Reminder scheduler
3. Support chat persistence basic
4. Live wash tracking backend snapshot

## FS1

1. Tích hợp realtime cho customer notifications/status
2. Tích hợp live wash tracker
3. Tích hợp support chat basic nếu bật

## FS2

1. Tích hợp realtime operations board
2. Tích hợp support inbox staff/admin basic

## FE

1. Polish UX cuối
2. Responsive cleanup
3. Accessibility/basic design consistency

---

## Task ưu tiên tuyệt đối trước mọi thứ khác

Đây là thứ phải có đầu tiên vì kiểm tra nền tảng:

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

---

## Cách giao việc ngắn gọn cho từng người

## BE1

### Giai đoạn đầu

- Auth
- User/Profile
- Vehicle
- Booking customer core

### Giai đoạn sau

- booking hardening
- consolidation

## BE2

### Giai đoạn đầu

- Operations
- Admin basic

### Giai đoạn sau

- Loyalty
- Notifications
- Reports
- Realtime

## FS1

### Giai đoạn đầu

- Customer auth/profile/vehicle/booking

### Giai đoạn sau

- loyalty/promotions/notifications/live tracking

## FS2

### Giai đoạn đầu

- Staff operations
- Admin bookings/customers

### Giai đoạn sau

- reports/master data/realtime inbox

## FE

### Giai đoạn đầu

- shared UI/layout/form validation/loading-error states

### Giai đoạn giữa

- hỗ trợ cả 2 fullstack cleanup integration

### Giai đoạn sau

- backend-support task nhẹ + UX polish

---

## Kết luận

Nếu anh giao theo tài liệu này, team sẽ đi từ:

- `demo nền tảng`

đến:

- `MVP có customer booking + staff operations + admin oversight`

đến:

- `production cleanup và realtime/features nâng cao`

Thứ tự đúng luôn là:

`Auth -> Customer Core -> Operations -> Loyalty/Admin -> Consolidation -> Production Hardening`
