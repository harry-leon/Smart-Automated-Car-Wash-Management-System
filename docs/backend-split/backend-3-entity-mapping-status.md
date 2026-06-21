# Backend 3 Entity Mapping Status

## Pham vi kiem ke

Kiem theo task `Backend 3: Operations, Admin, Notifications` va schema moi trong `C:\Users\Admin\Desktop\Database_2_fixed.sql`.

Muc tieu file nay:

- Xac nhan entity nao da map dung bang moi.
- Danh dau entity nao moi dung o muc compile-compatible, chua phai mapping sach 1:1.
- Chi tap trung vao pham vi task Backend 3 va cac bang doc phuc vu operations/admin/reporting.

## Da map dung va co the xem la xong cho task hien tai

### Owner chinh cua Backend 3

- `AuthUser` -> `users`
- `UserPreference` -> `user_preferences`
- `WashSession` -> `wash_sessions`
- `Notification` -> `notifications`

### Bang doc/reporting da duoc chuyen sang schema moi

- `CustomerVehicle` -> `vehicles`
- `ServicePackage` -> `packages`
- `ServiceCombo` -> `combos`
- `CustomerBooking` -> `bookings`
- `BookingOption` -> `booking_options`
- `BookingPromotion` -> `booking_promotions`
- `BookingStatusHistory` -> `booking_status_histories`
- `Payment` -> `payments`
- `PointTransaction` -> `point_transactions`

## Da cap nhat enum/trang thai theo schema moi

- `BookingStatus`
  - `PENDING`
  - `CONFIRMED`
  - `CHECKED_IN`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
  - `NO_SHOW`
- `PaymentStatus`
  - `UNPAID`
  - `PENDING_PAYMENT`
  - `PAID`
  - `FAILED`
  - `REFUNDED`
- `WashSessionStatus`
  - `PENDING`
  - `CHECKED_IN`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
- `VehicleStatus`
  - da bo sung `DELETED`

## Da co compatibility layer de giu code cu chay

Nhung entity duoi day da map bang moi, nhung van con method/field compatibility de khong vo code service cu:

- `AuthUser`
- `CustomerBooking`
- `ServicePackage`
- `ServiceCombo`
- `PointTransaction`
- `WashSession`

Dieu nay co nghia:

- Build dang pass.
- Nhung chua phai trang thai clean architecture.
- Con ton tai getter/method gia lap cho code cu.

## Chua xong han theo schema moi

Nhung entity duoi day van la ban cu hoac mapping chua sach 1:1 theo database moi:

- `LoyaltyAccount`
  - thieu `total_earned_points`
- `Promotion`
  - dang dung `String id`, trong DB moi la `uuid`
  - dang dung cac cot cu `discount_type`, `discount_value`, `applicable_tiers_csv`, `max_usage_per_customer`
  - schema moi dung `point_multiplier`, `start_at`, `end_at`
- `Voucher`
  - dang dung `code` lam `@Id`, trong DB moi co `id uuid` rieng
  - chua map day du cac cot theo schema voucher moi
- `CustomerCombo`
  - dang dung `String id`, `String comboId`
  - van con `purchaseBookingId`, `updatedAt` khong co trong schema moi
- `CustomerComboUsage`
  - dang dung `UUID id`, trong DB moi la `BIGSERIAL`
  - van con `serviceDate` khong co trong schema moi
  - `customer_combo_id` va `booking_id` dang de `String`, schema moi la `uuid`

## Ngoai pham vi Backend 3 hoac bang cu con sot lai

Nhung entity duoi day khong nam trong schema moi cua file SQL hoac thuoc flow cu:

- `BookingAddon`
- `ServiceAddon`
- `BookingOtpChallenge`
- `BookingOtpAuditLog`
- `BookingStaffTransferAudit`

Can tranh tiep tuc mo rong cac entity nay neu muc tieu la chi lam dung task Backend 3.

## Repository/runtime da xu ly

- Da sua JPQL trong `AuthUserRepository`
  - tu `SELECT account FROM users account`
  - thanh `SELECT account FROM AuthUser account`

## Trang thai hien tai

- `mvn -DskipTests compile`: pass

## Thu tu nen lam tiep

1. Chot nho entity owner cua Backend 3:
   - `WashSession`
   - `Notification`
   - `AuthUser`
2. Neu tiep tuc phan reporting dung schema moi:
   - `LoyaltyAccount`
   - `CustomerCombo`
   - `CustomerComboUsage`
   - `Promotion`
   - `Voucher`
3. Sau khi doi cac entity tren, sua repository/service phu thuoc theo tung cum:
   - loyalty
   - combo
   - promotion/voucher
4. Cuoi cung chay lai integration test cho:
   - operations
   - admin
   - booking
   - loyalty
