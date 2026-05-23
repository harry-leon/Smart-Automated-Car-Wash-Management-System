# Foundation Week Plan

## Timebox

- Start: `2026-05-23`
- End: `2026-05-29`

## Mục tiêu duy nhất trong tuần này

Hoàn thành các tính năng nền tảng để có thể demo được:

1. Đăng ký
2. OTP verify
3. Đăng nhập
4. JWT / RBAC
5. Profile cơ bản
6. Vehicle CRUD basic
7. Package list basic
8. Create booking basic
9. Booking list/detail basic
10. Staff queue/check-in/start/complete basic
11. Admin bookings/customers basic

## Không làm trong tuần này

- combo nâng cao
- voucher rule phức tạp
- loyalty hoàn chỉnh
- notifications hoàn chỉnh
- reports nâng cao
- support chat
- live wash tracker
- payment gateway thật

## Định nghĩa "xong" cho tuần này

### Customer demo được

- register
- verify OTP
- login
- xem profile
- thêm xe
- xem danh sách xe
- đặt lịch
- xem danh sách booking
- xem chi tiết booking

### Staff demo được

- login
- xem queue
- check-in booking
- start wash
- complete wash

### Admin demo được

- login
- xem dashboard basic
- xem bookings basic
- xem customers/accounts basic

---

## Task theo người

## BE1

- auth
- jwt/rbac
- profile
- vehicle
- booking customer core
- package list basic

## BE2

- admin basic
- operation basic
- booking read model cho staff/admin

## FS1

- customer auth/profile/vehicle/booking integration

## FS2

- staff/admin auth + operations/admin basic integration

## FE

- shared layout/components/forms/loading/error states
- hỗ trợ FS1/FS2 tháo mock UI và nối API

---

## Daily Plan

## 2026-05-23

### Mục tiêu ngày

- khóa scope tuần
- dựng nền auth/app shell
- thống nhất contract để ngày sau không lệch

### BE1

1. Tạo Spring Boot base project, cấu hình PostgreSQL, base package structure
2. Tạo user/auth entities cơ bản
3. Tạo `POST /auth/register`
4. Tạo `POST /auth/login`
5. Chuẩn hóa response wrapper + error handler

### BE2

1. Tạo module skeleton:
   - operation
   - admin
   - notification
2. Tạo seed data cho:
   - 1 admin
   - 2 staff
3. Tạo `GET /admin/dashboard/metrics` bản mock-from-db/basic
4. Tạo `GET /operations/queue` skeleton response

### FS1

1. Setup frontend data layer:
   - axios
   - interceptor skeleton
   - auth store
   - query client
2. Nối login page với API login
3. Chuẩn bị register page form mapping theo contract

### FS2

1. Nối login flow cho staff/admin
2. Chuẩn hóa role redirect:
   - customer
   - staff
   - admin
3. Dựng admin dashboard data fetch basic

### FE

1. Chuẩn hóa auth layouts
2. Chuẩn hóa shared form input/button/error message
3. Chuẩn hóa validators:
   - phone
   - password
   - otp
4. Hỗ trợ FS1/FS2 đồng bộ field names với API

### End-of-day expected

- login API có thể gọi
- frontend có thể gửi request login/register
- app shell auth chạy được

---

## 2026-05-24

### Mục tiêu ngày

- hoàn tất auth flow usable
- OTP + RBAC + profile basic

### BE1

1. Tạo `POST /auth/otp/send`
2. Tạo `POST /auth/otp/verify`
3. Tạo `POST /auth/refresh`
4. Cấu hình JWT filter + RBAC
5. Tạo `GET /users/profile`

### BE2

1. Tạo `GET /admin/accounts` hoặc `GET /admin/customers` basic
2. Tạo booking/admin read DTO skeleton để staff/admin dùng sau
3. Chuẩn bị operation entities cơ bản:
   - wash session
   - staff status

### FS1

1. Nối register page
2. Nối verify OTP page
3. Nối customer login flow hoàn chỉnh
4. Nối customer profile page basic

### FS2

1. Nối admin login flow hoàn chỉnh
2. Nối staff login flow hoàn chỉnh
3. Nối admin accounts/customers basic list

### FE

1. Chuẩn hóa access denied / unauthenticated UI
2. Chuẩn hóa loading/skeleton cho auth/profile
3. Hỗ trợ FS1/FS2 xử lý error mapping:
   - validation
   - invalid credentials
   - unauthorized

### End-of-day expected

- register → OTP → login chạy được
- redirect theo role chạy được
- profile load được sau login

---

## 2026-05-25

### Mục tiêu ngày

- hoàn tất vehicle basic
- mở đường cho booking

### BE1

1. Tạo `POST /customers/vehicles`
2. Tạo `GET /customers/vehicles`
3. Tạo `GET /customers/vehicles/:id`
4. Tạo `PUT /customers/vehicles/:id`
5. Tạo `POST /customers/vehicles/:id/set-primary`

### BE2

1. Tạo `GET /admin/bookings` basic skeleton
2. Tạo `GET /admin/bookings/:id` basic skeleton
3. Tạo queue sample mapping từ booking/session placeholder

### FS1

1. Nối vehicles list page
2. Nối add vehicle page
3. Nối vehicle detail/edit page
4. Nối set primary action

### FS2

1. Nối admin bookings list basic
2. Nối admin booking detail basic
3. Chuẩn bị staff operations board data hooks

### FE

1. Chuẩn hóa vehicle card/list/form UI
2. Chuẩn hóa empty state cho vehicles/bookings
3. Hỗ trợ form validation vehicle

### End-of-day expected

- customer thêm xe được
- customer xem xe được
- admin thấy booking screen basic dù chưa full flow

---

## 2026-05-26

### Mục tiêu ngày

- hoàn tất package list + booking create basic

### BE1

1. Tạo `GET /packages`
2. Tạo `GET /add-ons`
3. Tạo `POST /customers/bookings`
4. Tạo `GET /customers/bookings`
5. Tạo `GET /customers/bookings/:id`

### BE2

1. Tạo wash session entities/service skeleton thực tế hơn
2. Chuẩn bị endpoints:
   - create wash session
   - queue
3. Đồng bộ admin booking detail với booking payload thật

### FS1

1. Nối booking step 1:
   - select vehicle
2. Nối booking step 2:
   - package list
3. Nối booking step 3:
   - add-ons basic
4. Nối submit create booking

### FS2

1. Đồng bộ admin booking detail với payload từ backend
2. Chuẩn bị staff queue page render bằng queue contract

### FE

1. Chuẩn hóa checkout stepper UI
2. Chuẩn hóa booking summary card
3. Hỗ trợ FS1 mapping booking form -> API payload

### End-of-day expected

- customer chọn xe + package
- customer tạo booking basic được
- booking list bắt đầu có dữ liệu thật

---

## 2026-05-27

### Mục tiêu ngày

- hoàn tất customer booking demo
- bắt đầu staff operations thật

### BE1

1. Hoàn thiện `GET /customers/bookings/:id`
2. Fix validation cho booking create:
   - date/time
   - required vehicle/package
3. Nếu kịp: thêm `POST /bookings/validate-voucher` bản basic

### BE2

1. Tạo `POST /operations/wash-sessions`
2. Tạo `GET /operations/queue`
3. Tạo `POST /operations/wash-sessions/:id/check-in`

### FS1

1. Hoàn thiện booking list page
2. Hoàn thiện booking detail page
3. Hoàn thiện success state sau create booking

### FS2

1. Nối staff operations board
2. Nối check-in page
3. Hiển thị queue status basic

### FE

1. Chuẩn hóa status badge booking
2. Chuẩn hóa table/list visual cho queue
3. Hỗ trợ polish customer booking flow

### End-of-day expected

- customer flow demo được end-to-end
- staff nhìn thấy queue và check-in được

---

## 2026-05-28

### Mục tiêu ngày

- hoàn tất start/complete wash
- admin thấy được operational status

### BE1

1. Hỗ trợ sync booking status với operation flow
2. Fix booking/admin payload mismatch
3. Hoàn tất voucher validate basic nếu chưa xong

### BE2

1. Tạo `POST /operations/wash-sessions/:id/start`
2. Tạo `POST /operations/wash-sessions/:id/complete`
3. Đồng bộ `GET /admin/bookings` hiển thị status vận hành
4. Fix queue/status transition

### FS1

1. Đồng bộ booking badges/status customer theo operations changes
2. Retest create/list/detail booking

### FS2

1. Nối start wash action
2. Nối complete wash action
3. Đồng bộ admin bookings với status mới
4. Retest admin dashboard/accounts basic

### FE

1. Chuẩn hóa staff action button states
2. Chuẩn hóa status color/state mapping trên customer/staff/admin
3. Hỗ trợ fix nhanh UI bug cuối phase

### End-of-day expected

- staff complete wash được
- admin thấy booking status thay đổi
- customer thấy trạng thái booking được cập nhật

---

## 2026-05-29

### Mục tiêu ngày

- fix bug
- stabilize demo
- chốt bản kiểm tra nền tảng

### BE1

1. Fix auth/profile/vehicle/booking bugs
2. Test full customer flow bằng Postman
3. Chuẩn hóa sample data cho demo

### BE2

1. Fix operations/admin bugs
2. Test staff/admin flow bằng Postman
3. Chuẩn hóa sample booking/session data cho demo

### FS1

1. Retest:
   - register
   - login
   - profile
   - vehicles
   - create booking
   - booking list/detail
2. Fix UX errors/loading states cuối

### FS2

1. Retest:
   - staff login
   - queue
   - check-in
   - start
   - complete
   - admin dashboard
   - admin bookings/customers
2. Fix UI/data issues cuối

### FE

1. Polish UI consistency cho flow demo
2. Fix form/layout/state visual bugs
3. Chuẩn bị kịch bản demo và dữ liệu hiển thị đẹp

### End-of-day expected

- toàn bộ nền tảng chạy demo được
- có script demo rõ ràng
- không còn phụ thuộc vào mock cho các flow chính đã chọn

---

## Demo Script đề xuất cho ngày kiểm tra

1. Register customer mới
2. Verify OTP
3. Login customer
4. Mở profile
5. Thêm vehicle
6. Tạo booking
7. Xem booking list/detail
8. Login staff
9. Mở queue
10. Check-in booking
11. Start wash
12. Complete wash
13. Login admin
14. Xem dashboard
15. Xem bookings
16. Xem customers/accounts

---

## Ưu tiên fix bug nếu thiếu thời gian

Nếu đến `2026-05-28` mà chưa kịp, ưu tiên giữ:

1. Auth
2. Profile
3. Vehicle CRUD
4. Create booking
5. Booking list/detail
6. Staff queue/check-in/start/complete
7. Admin bookings/customers basic

Bỏ qua hoặc hạ nhẹ:

- voucher validate
- add-ons quá sâu
- dashboard metrics đẹp
- admin detail tabs sâu

---

## Kết luận

Tuần `23/05/2026 -> 29/05/2026` chỉ nên nhắm tới:

- `core foundation demo`

Không cố nhồi production đầy đủ trong tuần này.

Thước đo thành công là:

- customer flow chạy được
- staff flow chạy được
- admin flow basic chạy được
