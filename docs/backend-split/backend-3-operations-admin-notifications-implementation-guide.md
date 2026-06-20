# Backend 3 Implementation Guide

## Muc Tieu

Tai lieu nay tong hop cac thay doi can lam de hoan thanh task trong `backend-3-operations-admin-notifications.md`, doi chieu theo schema moi trong `Database_2_fixed.sql`.

Muc tieu la refactor backend hien tai dang bam schema cu sang schema moi, theo thu tu an toan de giam vo day chuyen.

## Nguyen Tac Thuc Hien

Lam theo thu tu sau:

1. Sua entity + repository shared truoc.
2. Sua `WashSession` va operations flow.
3. Sua booking/loyalty dependency.
4. Sua admin reporting.
5. Them notification + admin staff module.
6. Cuoi cung sua test integration cho operations/admin/booking/loyalty.

Ly do:

- Cac module operations, admin, loyalty dang phu thuoc manh vao entity/repository dung chung.
- Neu sua service truoc khi chot model moi, se phat sinh nhieu loi compile va logic chong cheo.
- Notification va admin staff la phan bo sung moi, nen de sau khi du lieu nen da on dinh.

## Tong Quan Lech Giua Code Hien Tai Va Database Moi

Code backend hien tai van dang dung nhieu bang/field cua schema cu:

- `auth_users` thay vi `users`
- `customer_bookings` thay vi `bookings`
- `customer_vehicles` thay vi `vehicles`
- `service_packages` thay vi `packages`
- `service_combos` thay vi `combos`
- `WashSessionStatus` van co `QUEUED`
- `wash_sessions` van map cac cot cu nhu `fee_currency`, `projected_loyalty_points`, `awarded_loyalty_points`, `queued_at`
- `PointTransaction` van bam `customer_id`, `reference_id` thay vi `loyalty_account_id`, `booking_id`

Neu khong sua cac model nay truoc, task backend 3 se khong the hoan thanh dung theo schema moi.

## Phase 1 - Sua Entity + Repository Shared

### 1.1 AuthUser -> users

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\AuthUser.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\AuthUserRepository.java`

Can lam:

- Doi `@Table(name = "auth_users")` thanh `users`.
- Doi mapping `status` theo enum moi cua bang `users`.
- Rà soat va loai bo hoac tach cac field khong con nam trong `users`:
  - `authProvider`
  - `oauthSubject`
  - `emailVerified`
  - `tier`
  - `isNewCustomer`
  - `language`
  - `theme`
  - `notificationsEnabled`
  - `emailNotifications`
  - `smsNotifications`
- Neu can giu preferences thi map sang `user_preferences`.
- Neu can giu loyalty tier thi lay tu `loyalty_accounts`, khong de trong `users`.

Luu y:

- Phan auth hien tai co the dang phu thuoc vao mot so field cu. Can tach ro phan nao thuoc backend 1, phan nao can gia lap tam.

### 1.2 CustomerBooking -> bookings

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\CustomerBooking.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\CustomerBookingRepository.java`

Can lam:

- Doi `@Table(name = "customer_bookings")` thanh `bookings`.
- Doi `id` tu `String` sang `UUID`.
- Them `bookingType`.
- Doi `booking_date` + `booking_time` sang `scheduled_at`.
- Doi `base_price` -> `base_amount`.
- Doi `addons_total` -> `options_amount`.
- Doi `voucher_code` -> `voucher_id`.
- Doi `voucher_discount` -> `discount_amount`.
- Giu `final_amount`, `estimated_duration_minutes`, `points_redeemed`, `points_discount`, `cancel_reason`.
- Them `note` neu can hien thi/quan tri.
- Bo cac field schema moi khong co:
  - `assigned_staff_id`
  - `confirmation_status`
  - `confirmation_expires_at`
  - `confirmed_at`
  - `refund_amount`
  - `refund_status`
  - `cancelled_at`
- Cap nhat method domain cho phu hop:
  - `confirmByOtp()`
  - `expireOtpConfirmation()`
  - `assignStaff()`
  - `cancel()`

Luu y:

- Bang moi khong con staff assignment trong `bookings`; staff assignment nam o `wash_sessions`.
- Neu muon giu OTP flow, phai xem lai task backend 2 va co the can bang phu rieng thay vi field tren `bookings`.

### 1.3 CustomerVehicle -> vehicles

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\CustomerVehicle.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\CustomerVehicleRepository.java`

Can lam:

- Doi `@Table(name = "customer_vehicles")` thanh `vehicles`.
- Doi join column `owner_user_id` thanh `customer_id`.
- Doi ten getter/logic neu can de nhat quan voi meaning moi la customer owner.
- Bo `deleted_at` neu schema moi khong co.

### 1.4 ServicePackage -> packages

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\ServicePackage.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\ServicePackageRepository.java`

Can lam:

- Doi `@Table(name = "service_packages")` thanh `packages`.
- Doi `id` sang `UUID` neu repository/service can theo schema moi.
- Giu cac cot co trong schema:
  - `name`
  - `description`
  - `base_price`
  - `duration_minutes`
  - `image_url`
  - `status`
- Bo field khong co trong schema:
  - `category`
  - `featuresCsv`
  - `popularity`

### 1.5 ServiceCombo -> combos

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\ServiceCombo.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\ServiceComboRepository.java`

Can lam:

- Doi `@Table(name = "service_combos")` thanh `combos`.
- Doi `id` sang `UUID`.
- Map lai field:
  - `price`
  - `original_price`
  - `duration_minutes`
  - `duration_days`
  - `max_usages`
  - `image_url`
  - `status`
- Bo field schema moi khong co:
  - `max_services`
  - `benefitsCsv`
  - `canUpgrade`
  - `upgradePriceFrom`
  - `is_active`

### 1.6 PointTransaction -> point_transactions

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\PointTransaction.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\PointTransactionRepository.java`

Can lam:

- Doi `id` sang `Long` de map `BIGSERIAL`.
- Doi relation tu `customer_id` sang `loyalty_account_id`.
- Them relation `booking_id`.
- Bo `reference_id`.
- Cap nhat query repository dang filter theo `customer` de join qua `loyaltyAccount.customer`.

Luu y:

- Loyalty service hien dang dung `referenceId = sessionId`. Cach nay khong con hop schema moi.
- Sau refactor, logic earn/redeem nen tro thang vao `booking_id` hoac relation phat sinh tu session -> booking.

## Phase 2 - Sua WashSession Va Operations Flow

### 2.1 WashSession entity/repository/lifecycle

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\WashSession.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\WashSessionStatus.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\WashSessionRepository.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\WashSessionLifecycle.java`

Can lam:

- Bo `QUEUED` khoi enum.
- Them `CANCELLED`.
- Bo field `queuedAt`.
- Bo field `feeCurrency`.
- Doi `projectedLoyaltyPoints` -> `projectedPoints`.
- Doi `awardedLoyaltyPoints` -> `awardedPoints`.
- Doi moi method repository dang dung `String bookingId` sang `UUID`.
- Cap nhat state transition:
  - `PENDING -> CHECKED_IN`
  - `CHECKED_IN -> IN_PROGRESS`
  - `IN_PROGRESS -> COMPLETED`
  - `PENDING/CHECKED_IN/IN_PROGRESS -> CANCELLED` neu business cho phep

### 2.2 OperationsService

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\OperationsService.java`

Can lam:

- Doi tat ca `bookingId` dang la `String` sang `UUID`.
- Create wash session chi cho booking `CONFIRMED`.
- Dung unique `wash_sessions.booking_id` de dam bao moi booking co toi da 1 wash session.
- Bo logic phu thuoc vao `QUEUED`.
- Neu van giu endpoint `/queue`, quy uoc lai no chi la thao tac operational, khong set status `QUEUED`.
- `checkIn()` cap nhat:
  - `wash_sessions.status = CHECKED_IN`
  - `checked_in_at`
  - `fee_amount`
  - `projected_points`
  - `bookings.status = CHECKED_IN`
- `start()` cap nhat:
  - `wash_sessions.status = IN_PROGRESS`
  - `started_at`
  - `bookings.status = IN_PROGRESS`
- `complete()` cap nhat:
  - `wash_sessions.status = COMPLETED`
  - `completed_at`
  - `awarded_points`
  - `bookings.status = COMPLETED`
  - goi loyalty flow cong diem dua tren booking/session
- `assigned_staff_id` phai tro den `users.id`.

### 2.3 Operations controllers

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\controller\OperationsController.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\controller\OperationsQueueController.java`

Can lam:

- Doi DTO/response phu hop enum moi.
- Rà soat endpoint `/queue` vi schema moi khong co state `QUEUED`.
- Cap nhat summary/board counters bo `QUEUED`.

### 2.4 Customer wash tracking

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\CustomerWashTrackingService.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\controller\CustomerWashTrackingController.java`

Can lam:

- Bo `QUEUED` khoi active statuses.
- Doi logic doc lich booking tu `scheduled_at`.
- Dam bao chi customer owner cua booking xem duoc tracking.
- Tinh progress dua tren `status`, `checked_in_at`, `started_at`, `completed_at`.

## Phase 3 - Sua Booking/Loyalty Dependency

Day la phase bat buoc vi operations va admin dang goi truc tiep vao booking/loyalty service.

### 3.1 BookingService

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\BookingService.java`

Can lam:

- Doi tat ca `String bookingId` sang `UUID`.
- Doi cac field pricing/scheduling sang schema moi:
  - `baseAmount`
  - `optionsAmount`
  - `discountAmount`
  - `scheduledAt`
- Bo logic `assignStaff()` tren booking.
- Doi booking detail/list response de khong phu thuoc field cu:
  - `confirmationStatus`
  - `paymentMethod` nam tren `payments`, khong nam trong `bookings`
  - `paymentStatus` nam tren `payments`
- Neu booking detail can payment info, phai join them bang `payments`.

### 3.2 LoyaltyService

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\LoyaltyService.java`

Can lam:

- Bo co che `referenceId`.
- Refactor earn transaction dua tren `booking_id` hoac `wash_session.booking.id`.
- Cap nhat `PointTransaction` mapping moi.
- Cap nhat logic lookup account qua `loyalty_accounts`.
- Neu tier nam o `loyalty_accounts`, dung account tier thay vi `AuthUser.tier`.

### 3.3 CustomerLoyaltyService va cac service loyalty lien quan

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\CustomerLoyaltyService.java`
- cac DTO/repository loyalty co tham chieu `referenceId`, `customer_id`, `tier` tren user

Can lam:

- Doi logic truy vet giao dich diem theo `booking_id`.
- Doi query join theo `loyalty_account`.

## Phase 4 - Sua Admin Reporting

### 4.1 AdminReportingService

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\AdminReportingService.java`

Can lam:

- Refactor manh cac query va mapping dang dung field cu cua booking/user/payment.
- Dashboard metrics phai doc tu:
  - `bookings`
  - `payments`
  - `users`
  - `promotions`
  - `wash_sessions`
  - `loyalty_accounts`
- Booking list/detail phai join:
  - `bookings`
  - `payments`
  - `vehicles`
  - `packages`
  - `combos`
- Customer detail phai tong hop tu:
  - `users`
  - `vehicles`
  - `bookings`
  - `loyalty_accounts`
- Wash history phai doc tu `wash_sessions`.
- Point history phai doc tu `point_transactions` qua `loyalty_account`.
- Bo cac field detail khong ton tai nua:
  - `confirmationStatus`
  - `voucherCode`
  - `basePrice`
  - `addonsTotal`
  - `bookingDate`
  - `bookingTime`
  - `paymentMethod` tren booking
  - `paymentStatus` tren booking

### 4.2 AdminReportingController

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\controller\AdminReportingController.java`

Can lam:

- Bo sung endpoint task yeu cau ma hien tai chua du:
  - `GET /api/v1/admin/customers/{customerId}/bookings`
  - `PUT /api/v1/admin/customers/{customerId}/status`
- Giữ:
  - accounts
  - bookings
  - customer detail
  - wash history
  - point history
  - tier history
- Cap nhat input/output type neu booking ID chuyen sang UUID.

### 4.3 AdminBookingService

File can sua:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\AdminBookingService.java`

Can lam:

- Doi `String bookingId` sang `UUID`.
- Detail response phai dung booking schema moi va payment join moi.

## Phase 5 - Them Notification + Admin Staff Module

### 5.1 Notification module

File moi nen tao:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\entity\Notification.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\repository\NotificationRepository.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\NotificationService.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\controller\NotificationController.java`
- DTO list/read request-response lien quan

Can lam:

- Map bang `notifications`:
  - `id`
  - `user_id`
  - `title`
  - `message`
  - `type`
  - `is_read`
  - `created_at`
- Them API:
  - `GET /api/v1/customers/notifications`
  - `PUT /api/v1/customers/notifications/{notificationId}/read`
- Co the tao notification khi:
  - booking confirmed
  - booking cancelled
  - wash completed

### 5.2 Admin staff module

File moi nen tao:

- `D:\CarWash\autowash-backend\src\main\java\com\autowash\service\AdminStaffService.java`
- `D:\CarWash\autowash-backend\src\main\java\com\autowash\controller\AdminStaffController.java`
- DTO create/list/update status/workload

Can lam:

- Staff la `users.role = STAFF`.
- API can co:
  - `POST /api/v1/admin/staff`
  - `GET /api/v1/admin/staff`
  - `PUT /api/v1/admin/staff/{staffId}/status`
  - `GET /api/v1/admin/staff/{staffId}/workload`
- Workload tinh tu `wash_sessions` va `bookings`.

## Phase 6 - Sua Test Integration

File test co kha nang phai sua:

- `D:\CarWash\autowash-backend\src\test\java\com\autowash\operation\WashSessionLifecycleTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\operation\StaffAssignmentServiceIntegrationTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\operation\OperationsControllerIntegrationTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\admin\AdminReportingControllerIntegrationTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\admin\AdminDashboardMetricsControllerIntegrationTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\admin\AdminBusinessHealthReportIntegrationTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\booking\BookingControllerIntegrationTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\loyalty\LoyaltyControllerIntegrationTest.java`
- `D:\CarWash\autowash-backend\src\test\java\com\autowash\loyalty\CustomerLoyaltyAndPromotionIntegrationTest.java`
- test notification/admin staff moi can them

Can test:

- Tao wash session tu booking `CONFIRMED`.
- Moi booking chi co 1 wash session.
- Check-in/start/complete lifecycle dung enum moi.
- Staff chi thay duoc session hop le.
- Customer chi xem duoc wash tracking cua minh.
- Admin bookings/customers/dashboard/reporting doc dung schema moi.
- Notification list/read hoat dong dung.
- Admin staff CRUD/workload dung.

## Checklist Hoan Thanh

### Bat buoc

- [ ] Shared entities da map dung schema moi
- [ ] Shared repositories da doi kieu ID va query
- [ ] `WashSession` da dung enum moi, bo field cu
- [ ] Operations lifecycle da sync `wash_sessions` va `bookings`
- [ ] Booking/Loyalty dependency da bo logic schema cu
- [ ] Admin reporting da doc tu bang moi
- [ ] Notification module da duoc them
- [ ] Admin staff module da duoc them
- [ ] Integration tests da cap nhat va pass

### Nen lam de tranh loi ve sau

- [ ] Tach ro phan schema moi nao la owner cua Backend 1, 2, 3
- [ ] Chot lai cach xu ly OTP/confirmation vi schema moi `bookings` khong con field confirmation cu
- [ ] Chot lai cach luu payment detail qua bang `payments`
- [ ] Chot lai migration strategy: sua `V1__init_schema.sql` neu reset DB, hoac tao `V2__...sql` neu nang cap DB dang chay

## Thu Tu Trien Khai De Xuat

1. Refactor `AuthUser`, `CustomerBooking`, `CustomerVehicle`, `ServicePackage`, `ServiceCombo`, `PointTransaction`.
2. Refactor repository tuong ung.
3. Refactor `WashSession`, `WashSessionRepository`, `WashSessionLifecycle`.
4. Refactor `OperationsService`, `OperationsController`, `OperationsQueueController`, `CustomerWashTrackingService`.
5. Refactor `BookingService`, `LoyaltyService`, `CustomerLoyaltyService`.
6. Refactor `AdminReportingService`, `AdminReportingController`, `AdminBookingService`.
7. Tao notification module.
8. Tao admin staff module.
9. Sua migration neu can.
10. Sua va chay lai integration tests.

## Ghi Chu Quan Trong

- Day khong phai task chi sua rieng backend 3. Backend 3 dang de tren mot tang model chung con bam schema cu.
- Neu chi sua operations/admin ma khong sua model chung, project se compile fail hoac logic sai.
- File `V1__init_schema.sql` hien tai da gan schema moi, nhung Java entity/service chua dong bo theo no.

