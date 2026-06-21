# Backend 3: Operations, Admin, Notifications

## Muc Tieu

Backend nay phu trach van hanh tai tram rua xe, staff workflow, admin dashboard/reporting va notification. Day la backend nen tach cuoi cung vi no doc tong hop du lieu tu Backend 1 va Backend 2 nhieu nhat.

Database dung chung voi 2 backend con lai. Backend nay la owner logic cua wash session, admin aggregation va notification.

## Pham Vi Chinh

- Tao va dieu phoi wash session tu booking da confirmed.
- Staff queue, check-in, start, complete, transfer.
- Customer wash tracking.
- Admin dashboard metrics.
- Admin accounts/bookings/customers/staff/reporting.
- Notification in-app.
- Cac API admin cho promotion/voucher co the tam thoi dat o Backend 2 vi owner DB la commerce; Backend 3 co the proxy neu frontend admin chi goi mot backend.

## API Phu Trach

```text
POST   /api/v1/operations/sessions
POST   /api/v1/operations/sessions/{sessionId}/queue
POST   /api/v1/operations/sessions/{sessionId}/check-in
POST   /api/v1/operations/sessions/{sessionId}/start
POST   /api/v1/operations/sessions/{sessionId}/complete

GET    /api/v1/operations/queue
GET    /api/v1/operations/staff/summary
GET    /api/v1/operations/staff/active
GET    /api/v1/operations/bookings/eligible-sessions

GET    /api/v1/customers/wash-tracking/active
GET    /api/v1/customers/wash-tracking/{washSessionId}

GET    /api/v1/admin/dashboard/metrics
GET    /api/v1/admin/reports/business-health
GET    /api/v1/admin/accounts
GET    /api/v1/admin/accounts/{accountId}
GET    /api/v1/admin/bookings
GET    /api/v1/admin/bookings/{bookingId}
GET    /api/v1/admin/customers/{customerId}
PUT    /api/v1/admin/customers/{customerId}/role
PUT    /api/v1/admin/customers/{customerId}/status
GET    /api/v1/admin/customers/{customerId}/bookings
GET    /api/v1/admin/customers/{customerId}/vehicles
GET    /api/v1/admin/customers/{customerId}/wash-sessions
GET    /api/v1/admin/customers/{customerId}/wash-history
GET    /api/v1/admin/customers/{customerId}/point-transactions
GET    /api/v1/admin/customers/{customerId}/point-history
GET    /api/v1/admin/customers/{customerId}/tier-history
GET    /api/v1/admin/operations/dashboard
POST   /api/v1/admin/staff
GET    /api/v1/admin/staff
PUT    /api/v1/admin/staff/{staffId}/status
GET    /api/v1/admin/staff/{staffId}/workload

GET    /api/v1/customers/notifications
PUT    /api/v1/customers/notifications/{notificationId}/read
```

## Bang Database Chinh

```text
wash_sessions
notifications
```

Bang doc phuc vu reporting:

```text
users
vehicles
bookings
booking_options
booking_status_histories
payments
packages
combos
services
loyalty_accounts
point_transactions
tier_histories
customer_combos
customer_combo_usages
vouchers
promotions
```

## Mapping Tu Backend Cu Sang Database Moi

```text
wash_sessions           -> wash_sessions
admin reporting queries -> doc tong hop tu users/bookings/payments/wash_sessions/loyalty
notification mock/local state -> notifications
```

Thay doi can luu y:

- `wash_sessions.booking_id` doi sang uuid.
- `wash_sessions.assigned_staff_id` FK den `users.id`.
- `wash_session_status` moi gom: `PENDING`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- `notifications` hien chi co in-app notification don gian, chua co channel email/sms delivery log.

## Task Can Lam

### Task 3.1 - Refactor Wash Session

- Doi entity `WashSession` theo bang `wash_sessions`.
- Doi `booking_id` sang UUID.
- Cap nhat status enum theo schema moi.
- Tao wash session chi khi booking da confirmed.
- Dam bao moi booking chi co mot wash session do unique `booking_id`.

### Task 3.2 - Refactor Operations Lifecycle

- Queue/check-in/start/complete cap nhat `wash_sessions`.
- Dong bo status booking tu Backend 2 hoac cap nhat chung DB trong giai do dung chung database.
- Ghi `checked_in_at`, `started_at`, `completed_at`.
- Khi complete, tinh/ghi `awarded_points` va goi Backend 2 de cong diem.
- Xu ly cancel/no-show neu business rule yeu cau.

### Task 3.3 - Refactor Staff Assignment

- Staff la record trong `users` voi `role = STAFF`.
- `assigned_staff_id` tro den `users.id`.
- `GET /api/v1/operations/staff/active` lay users active co role STAFF.
- Bo sung admin create/list/update status staff dua tren bang `users`.
- Workload staff duoc tinh tu `wash_sessions` va `bookings`.

### Task 3.4 - Refactor Operations Queue

- Queue doc tu `bookings`, `wash_sessions`, `vehicles`, `packages`, `combos`.
- Tach query theo status: confirmed, checked-in, in-progress.
- Dam bao response van phu hop staff UI hien tai.

### Task 3.5 - Customer Wash Tracking

- Lay active tracking tu `wash_sessions` + `bookings`.
- Chi customer owner cua booking moi xem duoc tracking.
- Tinh progress tu status va timestamp.
- Neu can realtime sau nay, them WebSocket/event sau khi REST on dinh.

### Task 3.6 - Admin Reporting

- Dashboard metrics doc tu `bookings`, `payments`, `users`, `promotions`.
- Accounts list doc tu `users`, join/lookup loyalty neu can tier/points.
- Booking list/detail doc tu `bookings`, `payments`, `vehicles`, `packages`, `combos`.
- Customer detail doc tong hop tu `users`, `vehicles`, `bookings`, `loyalty_accounts`.
- Bo sung endpoint `GET /api/v1/admin/customers/{customerId}/bookings`.
- Business health report doc tu booking/payment/loyalty theo date range.

### Task 3.7 - Admin Role Management

- `PUT /api/v1/admin/customers/{customerId}/role` cap nhat `users.role`.
- `PUT /api/v1/admin/customers/{customerId}/status` cap nhat `users.status`.
- Kiem tra permission admin.

### Task 3.8 - Notifications

- Tao entity/repository cho `notifications`.
- Them API list notification, mark one read.
- Tao notification khi booking confirmed/cancelled/completed neu can.
- Chua xu ly email/sms delivery trong schema hien tai.

## Phu Thuoc Voi Backend Khac

Backend 1 can cung cap:

- Staff/admin identity va status.
- Customer/account detail.
- Vehicle ownership khi tracking/customer detail can verify.

Backend 2 can cung cap:

- Booking eligible cho wash session.
- Booking status update contract.
- Payment/revenue data cho dashboard.
- Loyalty post-points khi wash completed.

## Kiem Thu

- Create wash session tu confirmed booking.
- Check-in/start/complete lifecycle.
- Staff chi thay/cap nhat session hop le.
- Customer chi xem wash tracking cua minh.
- Admin dashboard metrics dung voi sample data.
- Admin customer bookings, customer status, staff workload.
- Notification list/read.
