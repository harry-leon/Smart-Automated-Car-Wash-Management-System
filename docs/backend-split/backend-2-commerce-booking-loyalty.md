# Backend 2: Commerce, Booking, Payment, Loyalty

## Muc Tieu

Backend nay phu trach core business flow cua khach hang: catalog dich vu, combo, voucher, promotion, tao booking, thanh toan, tich diem va doi diem. Day la backend co nhieu logic nghiep vu nhat va nen duoc tach sau Backend 1.

Database dung chung voi Backend 1 va Backend 3. Backend nay la owner logic cua booking, catalog, payment va loyalty.

## Pham Vi Chinh

- Quan ly catalog: packages, services, package options, combos.
- Quan ly voucher va promotion phia customer/admin.
- Tao booking package/combo.
- Booking OTP confirmation neu van giu xac minh booking.
- Ap dung voucher, promotion, diem loyalty.
- Ghi payment record.
- Quan ly customer combo va combo usage.
- Quan ly loyalty account, point transaction, tier history.

## API Phu Trach

```text
GET    /api/v1/packages
GET    /api/v1/add-ons
GET    /api/v1/combos/available
POST   /api/v1/bookings/validate-voucher

POST   /api/v1/customers/bookings
GET    /api/v1/customers/bookings
GET    /api/v1/customers/bookings/{bookingId}
POST   /api/v1/customers/bookings/{bookingId}/pay
POST   /api/v1/customers/bookings/{bookingId}/cancel
POST   /api/v1/bookings/{bookingId}/apply-points

GET    /api/v1/customers/combos/active
POST   /api/v1/customers/combos/purchase
POST   /api/v1/customers/combos/{comboId}/activate
POST   /api/v1/customers/combos/{comboId}/purchase

GET    /api/v1/promotions
GET    /api/v1/promotions/active

POST   /api/v1/admin/promotions
GET    /api/v1/admin/promotions
GET    /api/v1/admin/promotions/{promotionId}
PUT    /api/v1/admin/promotions/{promotionId}
DELETE /api/v1/admin/promotions/{promotionId}
POST   /api/v1/admin/vouchers
GET    /api/v1/admin/vouchers
PUT    /api/v1/admin/vouchers/{voucherId}
DELETE /api/v1/admin/vouchers/{voucherId}
POST   /api/v1/admin/combos
GET    /api/v1/admin/combos
GET    /api/v1/admin/combos/{comboId}
PUT    /api/v1/admin/combos/{comboId}
DELETE /api/v1/admin/combos/{comboId}

GET    /api/v1/loyalty/account
GET    /api/v1/loyalty/transactions
GET    /api/v1/loyalty/history
POST   /api/v1/loyalty/redeem
POST   /api/v1/loyalty/earn
GET    /api/v1/customers/wash-history
```

## Bang Database Chinh

```text
packages
services
package_services
combos
combo_services
vouchers
voucher_tiers
promotions
promotion_tiers
bookings
booking_options
booking_promotions
booking_status_histories
payments
loyalty_accounts
point_transactions
tier_histories
customer_combos
customer_combo_usages
```

## Mapping Tu Backend Cu Sang Database Moi

```text
service_packages       -> packages
service_addons         -> services
package_add_ons        -> package_services
service_combos         -> combos
vouchers               -> vouchers + voucher_tiers
promotions             -> promotions + promotion_tiers
customer_bookings      -> bookings
booking_addons         -> booking_options
booking status audit   -> booking_status_histories
transactions/payment   -> payments
loyalty_accounts       -> loyalty_accounts
point_transactions     -> point_transactions
loyalty tier history   -> tier_histories
customer_combos        -> customer_combos
customer_combo_usages  -> customer_combo_usages
```

Thay doi can luu y:

- `bookings.id` doi tu string sang uuid.
- `scheduled_at` thay cho cap `booking_date` + `booking_time`.
- `booking_type` bat buoc: `PACKAGE` hoac `COMBO`.
- Package booking bat buoc co `package_id`, combo booking bat buoc co `combo_id`.
- `payments` tach rieng thay vi payment fields nam trong booking.
- `booking_options` snapshot option name/price tai thoi diem dat lich.
- `promotions` trong schema moi la point multiplier, khong con discount campaign truc tiep.
- `vouchers.discount_value` la bigint, phu hop ca fixed amount va percent tuy theo `discount_type`.

## Task Can Lam

### Task 2.1 - Refactor Catalog

- Doi entity/repository tu `ServicePackage` sang `Package`.
- Doi add-on/service entity sang bang `services`.
- Doi quan he package-add-on sang `package_services`.
- Cap nhat API `/api/v1/packages`, `/api/v1/add-ons`, `/api/v1/combos/available`.
- Bao toan response shape neu frontend dang dung type cu.

### Task 2.2 - Refactor Voucher Va Promotion

- Doi voucher targeting tu CSV sang bang `voucher_tiers`.
- Doi promotion targeting tu CSV sang bang `promotion_tiers`.
- Cap nhat admin promotion CRUD.
- Bo sung admin voucher CRUD tren `vouchers` va `voucher_tiers`.
- Bo sung admin combo CRUD tren `combos` va `combo_services`.
- Cap nhat voucher validation theo `start_at`, `end_at`, `usage_limit`, `used_count`, `new_customer_only`, `voucher_tiers`.
- Lam ro promotion hien la `point_multiplier`; discount nen di qua voucher.

### Task 2.3 - Refactor Booking

- Doi `CustomerBooking` sang bang `bookings`.
- Doi ID string sang UUID toan bo controller/service/dto neu chap nhan breaking API.
- Doi date/time input thanh `scheduled_at` hoac convert request cu sang `scheduled_at`.
- Validate `booking_type`: package/combo.
- Tinh `base_amount`, `options_amount`, `discount_amount`, `points_discount`, `final_amount`.
- Tao `booking_options` snapshot tu selected services.
- Tao `booking_status_histories` moi khi doi trang thai.

### Task 2.4 - Refactor Payment

- Tao payment record trong `payments` khi booking duoc tao.
- Map enum `payment_method`: `CASH_AT_COUNTER`, `BANK_TRANSFER`, `E_WALLET`.
- Map enum `payment_status`: `UNPAID`, `PENDING_PAYMENT`, `PAID`, `FAILED`, `REFUNDED`.
- Tach logic refund/payment status khoi booking.
- Bo sung endpoint `POST /api/v1/customers/bookings/{bookingId}/pay`.

### Task 2.5 - Refactor Loyalty

- Cap nhat `loyalty_accounts`: them `total_earned_points`.
- Doi transaction type sang enum moi: `EARN`, `REDEEM`, `EXPIRE`, `ADJUST`.
- Doi tier history sang `tier_histories`.
- Khi wash session completed tu Backend 3, tao point transaction va cap nhat account.
- Khi redeem/apply points, tru diem va cap nhat booking.

### Task 2.6 - Refactor Customer Combo

- Doi `combo_id` sang UUID.
- Quan ly `total_usages`, `remaining_usages`, `expires_at`.
- Ghi `customer_combo_usages` khi booking combo duoc su dung.
- Cap nhat trang thai `EXPIRED`, `USED_UP`, `CANCELLED`.

### Task 2.7 - Integration Contract

- Goi Backend 1 hoac doc chung DB de validate customer/vehicle.
- Cung cap endpoint/read method cho Backend 3 lay confirmed bookings eligible.
- Nhan event/call tu Backend 3 khi wash completed de post loyalty points.

## Phu Thuoc Voi Backend Khac

Backend 1 can cung cap:

- Current user identity tu JWT.
- Vehicle ownership check.
- Customer account status.

Backend 3 can goi Backend 2 de:

- Lay booking eligible tao wash session.
- Cap nhat booking status khi check-in/start/complete.
- Yeu cau post loyalty points sau khi complete.

## Kiem Thu

- Catalog list packages/services/combos.
- Voucher validation theo amount, tier, new customer, usage limit, date range.
- Voucher CRUD va combo CRUD cho admin.
- Booking create package/combo thanh cong va tao payment.
- Booking pay cap nhat `payments` va state lien quan.
- Booking cancel va status history.
- Apply points/redeem points.
- Complete wash flow post points idempotent, tranh cong diem 2 lan.
