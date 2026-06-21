# Backend 3 Entity Audit

> Muc tieu: doi chieu `Database_2_fixed.sql` voi cac model hien co trong `src/main/java/com/autowash/entity`.

## Kiem ke 3 cot

| Table | Entity hien co | Trang thai |
|---|---|---|
| `users` | `AuthUser` | du |
| `user_preferences` | `UserPreference` | du |
| `refresh_tokens` | `RefreshToken` | du |
| `otp_verifications` | `OtpRecord` | du |
| `vehicles` | `CustomerVehicle` | du |
| `packages` | `ServicePackage` | du |
| `services` | chua co | thieu |
| `package_services` | chua co | thieu |
| `combos` | `ServiceCombo` | du |
| `combo_services` | chua co | thieu |
| `vouchers` | `Voucher` | du |
| `voucher_tiers` | chua co | thieu |
| `promotions` | `Promotion` | du |
| `promotion_tiers` | chua co | thieu |
| `bookings` | `CustomerBooking` | du |
| `booking_options` | `BookingOption` | du |
| `booking_promotions` | `BookingPromotion` | du |
| `booking_status_histories` | `BookingStatusHistory` | du |
| `payments` | `Payment` | du |
| `wash_sessions` | `WashSession` | du |
| `loyalty_accounts` | `LoyaltyAccount` | du |
| `point_transactions` | `PointTransaction` | du |
| `tier_histories` | chua co | thieu |
| `customer_combos` | `CustomerCombo` | du |
| `customer_combo_usages` | `CustomerComboUsage` | du |
| `notifications` | `Notification` | du |

## Ghi chu ve trang thai "du"

`du` o day chi co nghia la:

- Da co entity tuong ung voi table.
- Khong co nghia la entity da sach 100% theo schema moi.
- Khong co nghia la service/repository phu thuoc da duoc don sach het.

## Cac table con thieu entity

Nhung table sau chua co entity rieng:

- `services`
- `package_services`
- `combo_services`
- `voucher_tiers`
- `promotion_tiers`
- `tier_histories`

## Cac file khong phai entity persistence

Thu muc `entity` hien van con chua cac `enum` va file ho tro cu.
Neu muon dung dung quy tac `entity chi chua persistence model`, cac file nay nen chuyen sang package rieng:

- `enums`
- `common`
- `value`

## Ket luan nhanh

- Entity core backend 3 da co table tuong ung.
- Database moi van con 6 table chua co entity rieng.
- Thu muc `entity` chua sach hoan toan vi con phai tach `enum` va cac file legacy sang package rieng.
