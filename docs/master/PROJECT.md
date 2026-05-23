# AutoWash Pro — Project Master Document

> **Mục đích:** Tài liệu duy nhất (single source of truth) cho **cả AI làm backend lẫn frontend**. Mô tả đầy đủ context, cấu trúc dự án, quy ước API, và bản đồ điều phối Frontend ↔ Backend theo từng Epic. Paste file này vào đầu mỗi conversation để AI luôn đúng hướng.

---

## PHẦN 1 — TỔNG QUAN HỆ THỐNG

### 1.1 Thông tin dự án

| Thuộc tính | Giá trị |
|---|---|
| **Tên sản phẩm** | AutoWash Pro / AURA CAR CARE |
| **Loại** | Ứng dụng quản lý dịch vụ rửa xe: đặt lịch, vận hành, loyalty |
| **Ngôn ngữ** | Tiếng Việt (VI) là chính, hỗ trợ EN |
| **Tiền tệ** | VND — số nguyên, không có số thập phân |

### 1.2 Stack kỹ thuật

| Layer | Công nghệ |
|---|---|
| **Frontend** | Next.js 14 App Router · TypeScript · Tailwind CSS |
| **State management** | Zustand (client state) + TanStack Query (server state) |
| **HTTP Client** | Axios + interceptor auto-refresh JWT |
| **Forms** | React Hook Form + Zod |
| **Realtime** | Native WebSocket API |
| **Charts** | Recharts (Admin) |
| **Backend** | Spring Boot + PostgreSQL (Modular Monolith) |
| **Auth** | JWT — Access Token (1h) + Refresh Token (30 ngày) |
| **Base API URL** | `https://api.autowash.local/api/v1` |
| **WebSocket URL** | `wss://api.autowash.local/ws` |

### 1.3 Ba workspace — Quy tắc bất biến

| Workspace | Người dùng | Role JWT | Route prefix hiện tại | Backend module / endpoint prefix |
|---|---|---|---|---|
| **Customer Portal** | Khách hàng | `CUSTOMER` | `/customer/*` | `auth`, `user`, `vehicle`, `booking`, `loyalty`, `promotion`, `notification` |
| **Staff Operations** | Nhân viên | `STAFF` | `/staff/*` | `operation`, API `/operations/*` |
| **Admin Dashboard** | Quản trị viên | `ADMIN` | `/admin/*` | `admin`, tất cả module |

> ⚠️ Không bao giờ trộn lẫn UI/logic/endpoint giữa 3 workspace. Component của Customer không dùng trong Admin.

### 1.4 Trạng thái prototype hiện tại

Theo `README-final.md`, repository hiện tại là **frontend prototype** mô phỏng nghiệp vụ bằng UI, route guard, local store và mock state. Chưa có backend thật, database thật, OTP/payment/email thật hoặc API enforcement thật.

Prototype hiện có hai state model:

- `src/lib/carwash-store.tsx`: shared portal store cho auth, staff/admin operations, settings, transactions, notifications, support chat, reminders và phần lớn logic portal.
- `src/modules/customer-booking/routes.tsx`: module-local customer booking store cho `/customer/home`, `/customer/vehicles`, `/customer/bookings`, `/customer/history`, `/customer/loyalty` và mock vehicles/packages/combos/vouchers/bookings.

Hệ quả: customer booking, admin và staff chưa đồng bộ hoàn toàn vào một source of truth. Khi code tiếp, phải xác định rõ đang bám theo **prototype hiện tại** hay **backend/API production target**.

---

## PHẦN 2 — CẤU TRÚC DỰ ÁN

### 2.1 Frontend — Cây thư mục

```
autowash-frontend/
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout: font, theme, QueryClient, AuthProvider
│   │   ├── page.tsx                    # Landing page công khai (GUEST)
│   │   │
│   │   ├── (auth)/                     # Route group — không tạo URL segment
│   │   │   ├── layout.tsx              # Centered card layout, no sidebar
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify/page.tsx         # Xác thực OTP sau đăng ký
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── customer/                   # ── CUSTOMER WORKSPACE ──
│   │   │   ├── layout.tsx              # Sidebar + topbar + loyalty badge + AuthGuard(CUSTOMER)
│   │   │   ├── home/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── history/page.tsx         # Prototype: booking/wash/point history
│   │   │   ├── settings/page.tsx
│   │   │   ├── vehicles/
│   │   │   │   ├── page.tsx            # Danh sách xe
│   │   │   │   ├── add/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx            # Lịch sử booking
│   │   │   │   ├── new/page.tsx        # ⭐ Checkout flow 7 bước
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── loyalty/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── redeem/page.tsx
│   │   │   │   └── history/page.tsx
│   │   │   ├── promotions/page.tsx
│   │   │   ├── vouchers/page.tsx
│   │   │   └── combos/page.tsx
│   │   │
│   │   ├── staff/                      # ── STAFF WORKSPACE (prototype hiện tại) ──
│   │   │   ├── layout.tsx              # Topbar đơn giản + AuthGuard(STAFF)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── operations/page.tsx     # ⭐ Operations board — màn hình chính
│   │   │   ├── sessions/[id]/page.tsx
│   │   │   └── check-in/page.tsx
│   │   │
│   │   └── admin/                      # ── ADMIN WORKSPACE ──
│   │       ├── layout.tsx              # Full sidebar + breadcrumb + AuthGuard(ADMIN)
│   │       ├── login/page.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── bookings/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx       # Assign staff
│   │       ├── customers/
│   │       │   ├── page.tsx            # Prototype label: Accounts
│   │       │   └── [id]/page.tsx       # Customer: 6 tab; staff/admin: summary panel
│   │       ├── staff/page.tsx
│   │       ├── packages/page.tsx
│   │       ├── add-ons/page.tsx
│   │       ├── combos/page.tsx
│   │       ├── promotions/page.tsx
│   │       ├── vouchers/page.tsx
│   │       ├── operations/page.tsx
│   │       ├── reports/page.tsx
│   │       └── settings/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # Shared primitives (dùng mọi workspace)
│   │   │   ├── Button.tsx · Input.tsx · Modal.tsx · Toast.tsx
│   │   │   ├── Badge.tsx · Skeleton.tsx · Pagination.tsx · EmptyState.tsx
│   │   ├── layouts/
│   │   │   ├── Sidebar.tsx · Topbar.tsx · Breadcrumb.tsx
│   │   │   └── AuthGuard.tsx           # HOC kiểm tra role, redirect nếu sai
│   │   ├── customer/
│   │   │   ├── BookingCard.tsx · VehicleCard.tsx · LoyaltyWidget.tsx
│   │   │   ├── CheckoutStepper.tsx · VoucherInput.tsx · PointsSlider.tsx
│   │   │   └── LiveWashTracker.tsx     # Prototype: progress theo wash session timing
│   │   ├── operations/
│   │   │   ├── KanbanBoard.tsx · SessionCard.tsx · CheckInPanel.tsx · WashTimer.tsx
│   │   ├── support/
│   │   │   ├── SupportChatButton.tsx · SupportInbox.tsx · SupportThread.tsx
│   │   └── admin/
│   │       ├── DataTable.tsx · KpiCard.tsx · ReportChart.tsx · CustomerTabs.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                      # ⭐ Axios instance + interceptor auto-refresh token
│   │   ├── validators.ts               # Regex: phone, plate, email, password, OTP
│   │   ├── utils.ts                    # formatVND, formatDate, formatPlate, getStatusLabel
│   │   └── constants.ts               # Tất cả enums: BookingStatus, Tier, VehicleType...
│   │
│   ├── hooks/
│   │   ├── useAuth.ts · useBookings.ts · useLoyalty.ts · useVehicles.ts
│   │   ├── useWebSocket.ts             # Kết nối + xử lý events realtime
│   │   └── useReminderPoller.ts        # Polling mỗi 30 giây
│   │
│   ├── store/                          # Zustand stores
│   │   ├── auth.store.ts               # accessToken, user, role
│   │   ├── user.store.ts               # profile, tier, loyaltyBalance
│   │   ├── notification.store.ts       # unreadCount, notifications[]
│   │   ├── support.store.ts            # Prototype/target: support threads, unread counts
│   │   └── booking.store.ts            # checkoutDraft — giữ state 7 bước
│   │
│   └── types/                          # TypeScript từ API contracts
│       ├── api.types.ts                # ApiResponse<T>, PaginatedResponse<T>
│       ├── user.types.ts · booking.types.ts · loyalty.types.ts · vehicle.types.ts
│
├── middleware.ts                        # ⭐ Route protection theo role (Edge Runtime)
├── .env.local                          # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
├── next.config.ts · tailwind.config.ts · tsconfig.json
```

### 2.2 Backend — Module structure (Spring Boot)

```
com.autowash
├── auth          # Đăng ký, OTP, login, JWT, RBAC
├── user          # Profile, preferences, status
├── vehicle       # Quản lý xe của khách hàng
├── booking       # Checkout flow, booking lifecycle, payment mock
├── operation     # Wash session, staff queue, check-in flow
├── loyalty       # Points ledger, tier, redemption, expiry
├── promotion     # Packages, add-ons, combos, vouchers, promotions
├── admin         # Dashboard metrics, reports, accounts management
├── notification  # Templates, reminders, in-app notifications, support reply notifications
├── support       # Customer support chat threads/messages (có thể gộp notification ở giai đoạn prototype)
├── shared        # Exception, validator, constant, dto, util
└── integration   # Adapters: payment, sms, email (mock hiện tại)
```

---

## PHẦN 3 — GIAO THỨC API (Frontend ↔ Backend)

### 3.1 Response format — Bắt buộc

Mọi response từ backend đều wrap trong cấu trúc chuẩn:

```typescript
// Single object
{ success: true, statusCode: 200, message: string, data: T, timestamp: string }

// List với pagination
{ success: true, data: T[], pagination: { page, limit, total, totalPages, hasMore } }

// Error
{ success: false, statusCode: number, message: string, errorCode: string,
  errors?: { field: string, message: string, code: string }[] }
```

> **Frontend rule:** Luôn đọc `response.data`, luôn check `success === true`.

### 3.2 HTTP conventions

| Method | Ý nghĩa |
|---|---|
| GET | Lấy dữ liệu |
| POST | Tạo mới hoặc trigger action |
| PUT | Cập nhật toàn bộ |
| PATCH | Cập nhật một phần |
| DELETE | Soft delete (set status = INACTIVE/DELETED) |

### 3.3 Pagination query params

```
?page=1&limit=20&sort=createdAt&order=desc
&status=CONFIRMED&dateFrom=2026-01-01&dateTo=2026-12-31
&searchQuery=...&tier=SILVER,GOLD
```

### 3.4 Authentication flow

```
Token storage:
  Access Token  → in-memory (Zustand) hoặc HTTP-only cookie   [1 giờ]
  Refresh Token → HTTP-only cookie                             [30 ngày]
  localStorage  → chỉ: language, theme, reminderSent_*

Auto-refresh (bắt buộc implement trong api.ts):
  Request → 401 TOKEN_EXPIRED
    → POST /auth/refresh
    → Lưu access token mới vào store
    → Retry request gốc tự động
    → Nếu refresh fail → clear store → redirect /login

Redirect sau login theo role:
  CUSTOMER → /customer/home
  STAFF    → /staff/dashboard
  ADMIN    → /admin/dashboard
  GUEST    → /
```

### 3.5 RBAC — Backend Spring Security

```java
// Customer endpoints
@PreAuthorize("hasRole('CUSTOMER')")
GET  /api/v1/customers/vehicles
POST /api/v1/customers/bookings

// Staff endpoints
@PreAuthorize("hasRole('STAFF')")
POST /api/v1/operations/wash-sessions/{id}/check-in

// Admin endpoints
@PreAuthorize("hasRole('ADMIN')")
POST /api/v1/admin/packages
GET  /api/v1/admin/reports/{reportType}

// Public endpoints
@PreAuthorize("permitAll()")
GET  /api/v1/packages
POST /api/v1/auth/login
```

---

## PHẦN 4 — BẢN ĐỒ ĐIỀU PHỐI FRONTEND ↔ BACKEND

Mỗi Epic backend tương ứng với features cụ thể trên frontend. AI phải đọc phần này trước khi code bất kỳ thứ gì.

---

### Epic 1 — Authentication (Backend: `auth` module)

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 1.1 Register | `/register` | `POST /auth/register` | Validate phone/password realtime |
| Task 1.2 OTP | `/verify` | `POST /auth/otp/send` + `/verify` | Countdown 5 phút, resend sau khi hết |
| Task 1.3 Login | `/login` | `POST /auth/login` | Redirect theo `role` trong response |
| Task 1.4 Token refresh | `api.ts` interceptor | `POST /auth/refresh` | Auto-retry request gốc |
| Task 1.5 Logout | Mọi layout | `POST /auth/logout` | Clear store + redirect `/` |
| Task 1.6 RBAC | `middleware.ts` + `AuthGuard.tsx` | — | Chặn route sai role |
| Task 1.7 Password reset | `/forgot-password` | `POST /auth/forgot-password/request` + `/reset` | OTP flow tương tự verify |

**Validation client (bắt buộc):**
- Phone: `/^0[0-9]{9}$/`
- Password: min 8 ký tự, có HOA, thường, số, ký tự đặc biệt
- OTP: `/^[0-9]{6}$/`

---

### Epic 2 — User Profile (Backend: `user` module)

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 2.1 Get profile | App init + `/customer/profile` | `GET /users/profile` | Cache bằng React Query, dùng cho sidebar |
| Task 2.2 Update profile | `/customer/profile` | `PUT /users/profile` | Hiện toast success/error |
| Task 2.3 Preferences | `/customer/settings` | `GET/PUT /users/preferences` | Apply theme/language ngay lập tức |
| Task 2.4 Update status | `/admin/customers/:id` | `PUT /admin/customers/:id/status` | Admin only, có confirm dialog |

---

### Epic 3 — Vehicle Management (Backend: `vehicle` module)

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 3.1 Create | `/customer/vehicles/add` | `POST /customers/vehicles` | Validate plate format `/^[0-9]{2}[A-Z]{1}-[0-9]{5,6}$/` |
| Task 3.2 List | `/customer/vehicles` | `GET /customers/vehicles` | Hiện badge "Chính" cho isPrimary |
| Task 3.3 Detail | `/customer/vehicles/:id` | `GET /customers/vehicles/:id` | Hiện lastServiceDate, totalServices |
| Task 3.4 Update | `/customer/vehicles/:id` | `PUT /customers/vehicles/:id` | Plate là immutable — disable field |
| Task 3.5 Delete | `/customer/vehicles` | `DELETE /customers/vehicles/:id` | Confirm dialog, báo lỗi nếu có booking active |
| Task 3.6 Set primary | `/customer/vehicles` | `POST /customers/vehicles/:id/set-primary` | Optimistic update: swap badge ngay |

---

### Epic 4 — Booking (Backend: `booking` module)

#### Checkout flow 7 bước — Feature quan trọng nhất

```
Bước 1 → Chọn xe          GET /customers/vehicles
Bước 2 → Chọn gói/combo   GET /packages  |  GET /combos/available
Bước 3 → Chọn add-ons     GET /add-ons  (filter theo packageId)
Bước 4 → Ngày & giờ       Validate: date > today
Bước 5 → Voucher code     POST /bookings/validate-voucher  (realtime khi blur)
Bước 6 → Thanh toán       BANK_TRANSFER | E_WALLET | CASH_AT_COUNTER
Bước 7 → Xác nhận         POST /customers/bookings  →  màn hình thành công
```

**Tính giá realtime:** `finalAmount = basePrice + addonsTotal - voucherDiscount`

State 7 bước lưu trong `booking.store.ts` — không mất khi navigate giữa các bước.

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 4.1 Packages | `/customer/bookings/new` (bước 2) | `GET /packages` | Chỉ hiện ACTIVE |
| Task 4.2 Add-ons | `/customer/bookings/new` (bước 3) | `GET /add-ons` | Filter theo selected package |
| Task 4.3 Create booking | `/customer/bookings/new` (bước 7) | `POST /customers/bookings` | Max 3 active bookings |
| Task 4.4 Payment | Sau bước 7 | `POST /customers/bookings/:id/pay` | CASH_AT_COUNTER → PENDING_PAYMENT |
| Task 4.5 List bookings | `/customer/bookings` | `GET /customers/bookings` | Filter by status, date range |
| Task 4.6 Booking detail | `/customer/bookings/:id` | `GET /customers/bookings/:id` | Hiện wash session nếu đã tạo |
| Task 4.7 Cancel | `/customer/bookings/:id` | `POST /customers/bookings/:id/cancel` | Không cancel nếu IN_PROGRESS/COMPLETED |
| Task 4.8 Validate voucher | Bước 5 checkout | `POST /bookings/validate-voucher` | Gọi khi blur input, hiện discount ngay |

---

### Epic 5 — Operations / Wash Session (Backend: `operation` module)

#### Luồng state wash session

```
Admin tạo session   POST /operations/wash-sessions
         ↓ PENDING
Staff check-in      POST /operations/wash-sessions/:id/check-in
         ↓ CHECKED_IN   (bật nút "Bắt đầu rửa")
Staff bắt đầu       POST /operations/wash-sessions/:id/start
         ↓ IN_PROGRESS  (countdown timer)
Staff hoàn thành    POST /operations/wash-sessions/:id/complete
         ↓ COMPLETED    (hiện điểm earned)
```

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 5.1 Create session | `/admin/bookings/:id` | `POST /operations/wash-sessions` | Admin assign staff + time |
| Task 5.2 Check-in | `/staff/check-in` | `POST /operations/wash-sessions/:id/check-in` | Plate phải khớp booking |
| Task 5.3 Start | `/staff/sessions/:id` | `POST /operations/wash-sessions/:id/start` | Bật countdown timer |
| Task 5.4 Complete | `/staff/sessions/:id` | `POST /operations/wash-sessions/:id/complete` | Hiện điểm loyalty earned |
| Task 5.5 Queue | `/staff/operations` ⭐ | `GET /operations/queue` | Board 4 trạng thái, poll 30s, WebSocket |
| Task 5.6 Admin ops dashboard | `/admin/operations` | `GET /admin/operations/dashboard` | Metrics + full queue |

**Kanban queue rules:**
- 4 cột: Pending · Checked-In · In Progress · Completed
- Auto-refresh mỗi 30 giây
- WebSocket event `operations:queue:updated` cập nhật realtime
- Màu priority: 🔴 Trễ (>15 phút) | 🟡 Sắp đến (<30 phút) | 🟢 Bình thường

---

### Epic 6 — Staff Management (Backend: `operation` module)

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 6.1 Create staff | `/admin/staff` | `POST /admin/staff` | Admin only |
| Task 6.2 List staff | `/admin/staff` | `GET /admin/staff` | Filter by status, department |
| Task 6.4 Update status | `/admin/staff` | `PUT /admin/staff/:id/status` | ON_LEAVE → unavailable for assign |
| Task 6.5 Workload | `/admin/bookings/:id` | `GET /admin/staff/:id/workload` | Dùng khi assign staff |

---

### Epic 7 — Loyalty & Points (Backend: `loyalty` module)

| Backend Task | Frontend Page | Endpoint | UI Notes |
|---|---|---|---|
| Task 7.1 Earn points | — (auto sau complete) | Internal trigger | Frontend nhận qua WS `loyalty:points:updated` |
| Task 7.3 Redeem → voucher | `/customer/loyalty/redeem` | `POST /loyalty/redeem-points` | Slider 50–200 điểm, hiện VND value realtime |
| Task 7.4 Redeem → checkout | `/customer/bookings/new` bước 5 | `POST /bookings/:id/apply-points` | Slider, cập nhật finalAmount realtime |
| Task 7.7 Account details | `/customer/loyalty` | `GET /loyalty/account` | Hiện tier, balance, nextThreshold, warning |
| Task 7.8 Transaction history | `/customer/loyalty/history` | `GET /loyalty/transactions` | Color: EARN=green, REDEEM=red, EXPIRE=gray |

**Loyalty display rules:**
- 1 điểm = 1.000 VND voucher
- Hệ số tier: Member 1x · Silver 1.2x · Gold 1.5x · Platinum 2x
- Warning hết hạn: lấy từ `expiringPointsWarnings[]` trong GET /loyalty/account
- Max 3 voucher active cùng lúc

---

### Epic 8 — Promotions, Vouchers, Combos (Backend: `promotion` module)

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 8.1 Promotions CRUD | `/admin/promotions` | `POST/GET/PUT/DELETE /admin/promotions` | 3 targeting mode |
| Task 8.2 Vouchers CRUD | `/admin/vouchers` | `POST/GET/PUT/DELETE /admin/vouchers` | isNewCustomer check |
| Task 8.3 Combos CRUD | `/admin/combos` | `POST/GET/PUT/DELETE /admin/combos` | Admin setup |
| Task 8.4 Activate combo | `/customer/combos` | `POST /customers/combos/:id/activate` | +250 điểm khi upgrade |
| Task 8.5 List combos | `/customer/combos` | `GET /combos/available` | Hiện upgrade eligibility |

---

### Epic 9 — Admin Management (Backend: `admin` module)

| Backend Task | Frontend Page | Endpoint | Ghi chú |
|---|---|---|---|
| Task 9.1 KPI metrics | `/admin/dashboard` | `GET /admin/dashboard/metrics` | Cards: bookings, revenue, customers... |
| Task 9.2 Booking list | `/admin/bookings` | `GET /admin/bookings` | Full filter: status, date, search |
| Task 9.3 Booking detail + assign | `/admin/bookings/:id` | `GET/PUT /admin/bookings/:id` | Assign staff chỉ khi session IN_PROGRESS |
| Task 9.4 Accounts directory | `/admin/customers` (label `Accounts`) | `GET /admin/accounts` | Merge customer/staff/admin, filter role/tier/status |
| Task 9.5 Customer detail | `/admin/customers/:id` | 6 endpoints tương ứng 6 tab | Staff/admin account mở summary panel nhẹ hơn |
| Task 9.6 Customer status | `/admin/customers/:id` | `PUT /admin/customers/:id/status` | ACTIVE/BLOCKED/SUSPENDED |
| Task 9.7 Reports | `/admin/reports` | `GET /admin/reports/:reportType` | Thêm daily staff wash counts, date filter, pagination |

**6 tab customer detail:**

| Tab | Endpoint backend |
|---|---|
| Hồ sơ | `GET /admin/customers/:id` |
| Xe | `GET /admin/customers/:id/vehicles` |
| Booking | `GET /admin/customers/:id/bookings` |
| Lịch sử rửa | `GET /admin/customers/:id/wash-sessions` |
| Giao dịch điểm | `GET /admin/customers/:id/point-transactions` |
| Lịch sử tier | `GET /admin/customers/:id/tier-history` |

---

### Epic 10 — Notifications, Support Chat & Live Tracking (Backend: `notification`, `support`, `operation`)

| Backend Task | Frontend Implementation | Ghi chú |
|---|---|---|
| Task 10.2 Booking confirmation | Toast khi booking confirmed + badge chuông | Nhận qua WS `notification:received` |
| Task 10.3 Booking reminder | `useReminderPoller` — poll 30 giây | Deduplicate bằng `reminderSent_{bookingId}_{type}` trong localStorage |
| Task 10.5 Points expiry warning | Banner cảnh báo trong `/customer/loyalty` | Data từ `expiringPointsWarnings[]` |
| Task 10.7 Notification center | `/customer/notifications` | `GET /notifications` · `PUT /notifications/:id/read` |
| Task 10.8 Support chat | Floating chat mọi role + staff/admin inbox | Customer có thread riêng; staff/admin dùng chung inbox |
| Task 10.9 Live wash tracker | `/customer/home` | Tính progress từ wash session status, start time, package/add-on duration |

**Reminder timing:** 24 giờ trước · 1 giờ trước · 15 phút trước

---

## PHẦN 5 — QUY ƯỚC CHUNG

### 5.1 Error handling — Mapping UI

| HTTP | errorCode | Xử lý Frontend |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Lỗi inline theo từng field |
| 401 | `TOKEN_EXPIRED` | Auto-refresh, retry |
| 401 | `TOKEN_INVALID` | Redirect login |
| 403 | `INSUFFICIENT_PERMISSION` | Toast "Không có quyền" |
| 404 | `RESOURCE_NOT_FOUND` | Empty state / 404 |
| 409 | `DUPLICATE_PHONE` | "Số điện thoại đã đăng ký" |
| 409 | `DUPLICATE_PLATE` | "Biển số đã tồn tại" |
| 422 | `MAX_ACTIVE_BOOKINGS_EXCEEDED` | "Đã có 3 booking đang hoạt động" |
| 422 | `VOUCHER_EXPIRED` | "Voucher đã hết hạn" |
| 422 | `VOUCHER_ALREADY_USED` | "Voucher đã được dùng" |
| 422 | `INSUFFICIENT_POINTS` | "Không đủ điểm" |
| 422 | `RESOURCE_LOCKED` | "Đang có booking liên quan" |
| 429 | `RATE_LIMIT_EXCEEDED` | "Thử lại sau" |
| 500 | `INTERNAL_SERVER_ERROR` | Toast lỗi chung |

### 5.2 Enums — Frontend constants.ts

```typescript
// BookingStatus → badge color
PENDING      → yellow    "Chờ thanh toán"
CONFIRMED    → blue      "Đã xác nhận"
CHECKED_IN   → purple    "Đã check-in"
IN_PROGRESS  → orange    "Đang rửa"
COMPLETED    → green     "Hoàn thành"
CANCELLED    → red       "Đã hủy"
NO_SHOW      → gray      "Không đến"

// LoyaltyTier → badge color
MEMBER   → gray    "Thành viên"
SILVER   → slate   "Bạc"
GOLD     → amber   "Vàng"
PLATINUM → purple  "Bạch kim"

// PaymentMethod
BANK_TRANSFER    → "Chuyển khoản ngân hàng"
E_WALLET         → "Ví điện tử"
CASH_AT_COUNTER  → "Tiền mặt tại quầy"

// VehicleType
CAR · SUV · TRUCK · MOTORBIKE · VAN

// PointTransactionType → color
EARN                 → green   "+X điểm"
REDEEMED_AT_CHECKOUT → red     "-X điểm (đặt lịch)"
REDEEMED_FOR_VOUCHER → red     "-X điểm (voucher)"
EXPIRED              → gray    "-X điểm (hết hạn)"
ADMIN_ADJUSTMENT     → purple  "±X điểm"
```

### 5.3 Validation — validators.ts

| Field | Pattern |
|---|---|
| `phone` | `/^0[0-9]{9}$/` |
| `email` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `password` | Min 8 ký tự · có HOA · thường · số · ký tự đặc biệt |
| `plate` | `/^[0-9]{2}[A-Z]{1}-[0-9]{5,6}$/` |
| `otp` | `/^[0-9]{6}$/` |
| `date` | `YYYY-MM-DD` · phải > today |
| `time` | `/^([01]\d|2[0-3]):[0-5]\d$/` |

### 5.4 Hiển thị tiền VND

```typescript
formatVND(150000) → "150.000 đ"
// Màu xanh lá → giảm giá / tiết kiệm
// Màu đỏ → tổng cần trả
// Không bao giờ hiện số thập phân
```

### 5.5 WebSocket events

| Event | Nhận bởi | Xử lý |
|---|---|---|
| `operations:queue:updated` | Staff | Refresh Kanban |
| `booking:status:changed` | Customer | Update badge status |
| `notification:received` | Customer | Toast + tăng badge chuông |
| `loyalty:points:updated` | Customer | Update số dư điểm |
| `support:message:received` | Customer · Staff · Admin | Update thread + unread count |
| `wash-session:progress:updated` | Customer | Update live wash tracker |

---

## PHẦN 6 — RANH GIỚI TRÁCH NHIỆM

### Frontend làm:
- ✅ Client-side validation (phone, plate, password, OTP format)
- ✅ Token auto-refresh (interceptor trong `api.ts`)
- ✅ Route protection theo role (`middleware.ts` + `AuthGuard`)
- ✅ Optimistic updates (set primary vehicle, mark notification read)
- ✅ Reminder polling mỗi 30 giây
- ✅ Prototype support chat, notification bell, live wash tracker bằng local store khi chưa có backend
- ✅ Cache server data bằng React Query (tránh gọi API thừa)
- ✅ Loading states, error toasts, empty states
- ✅ Realtime qua WebSocket (nhận event, update UI)

### Frontend KHÔNG làm (để backend lo):
- ❌ Tự tính điểm thưởng hay hệ số tier
- ❌ Tự validate voucher eligibility phức tạp → gọi `/bookings/validate-voucher`
- ❌ Xử lý logic payment
- ❌ Routing support chat, phân công nhân viên hỗ trợ, lưu message bền vững
- ❌ Tự quyết định progress thật của wash session ngoài dữ liệu vận hành
- ❌ Batch job, schedule, tier review

### Backend làm:
- ✅ Toàn bộ business logic và validation nghiệp vụ
- ✅ Tính điểm, hệ số tier, voucher eligibility
- ✅ Lưu support threads/messages, unread counts, notification records
- ✅ Cung cấp dữ liệu live tracking từ wash session và duration thực tế
- ✅ Gửi SMS/Email (mock hiện tại)
- ✅ Batch jobs: tier review hàng tháng, points expiry sweep
- ✅ Audit logging mọi state transition

---

## PHẦN 7 — FUTURE SCOPE (Chưa implement)

Không code khi chưa có API:

- Rating/Review dịch vụ sau khi hoàn thành
- Biometric login
- Payment gateway thực: VNPay, MoMo, Stripe (Task 13.1)
- SMS gateway thực: Twilio, AWS SNS (Task 13.2)
- Export báo cáo CSV/PDF
- Offline queue

---

## PHẦN 8 — CHECKLIST TRƯỚC MỖI TASK

```
AI phải xác định trước khi bắt đầu code bất kỳ thứ gì:

□ Đang làm Frontend hay Backend?
□ Workspace nào?         Customer / Staff / Admin
□ Epic nào?              1–13 (xem Phần 4)
□ Role được phép?        CUSTOMER | STAFF | ADMIN
□ API endpoint tương ứng?   (xem bảng mapping Phần 4)
□ State nào cần quản lý?    local / Zustand / React Query
□ Error cases cần handle?   (xem Phần 5.1)
□ Enum / constant cần dùng? (xem Phần 5.2)
□ Validation phía client?   (xem Phần 5.3)
□ Feature có trong scope?   (xem Phần 7)
□ Backend task tương ứng đã sẵn chưa? (nếu chưa: mock response)
```

---

*Tổng hợp từ: `BACKEND_CONTEXT.md` · `FRONTEND_CONTEXT.md`*
*Cập nhật: May 2026*
