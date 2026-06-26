# 🚗 AutoWash Pro – Business Rules Specification

**Project:** SU26SWP01 | Group 1 | Summer 2026 | **Total: 74 BRs**

---

## 1. Account Registration

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-01 | Account Registration | Each customer must have a unique phone number | Must Have | System |
| BR-02 | Account Registration | One phone number cannot create multiple active accounts | Must Have | System |
| BR-03 | Account Registration | Customer must provide full name, phone number, and at least one vehicle | Must Have | Customer |
| BR-04 | Account Registration | Phone number must follow Vietnamese format | Must Have | System |
| BR-05 | Account Registration | New customer starts at Member tier | Must Have | System |
| BR-06 | Account Verification | Account activates only after OTP verification | Must Have | System |
| BR-07 | Phone Number Change | New phone number must be OTP verified | Must Have | Customer |
| BR-08 | Account Management | Account status: Active / Inactive / Blocked | Must Have | Admin |
| BR-09 | Account Restriction | Blocked account cannot book or redeem points | Must Have | System |

---

## 2. Vehicle Management

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-10 | Vehicle Management | Customer must have at least one vehicle | Must Have | Customer |
| BR-11 | Vehicle Management | License plate cannot be empty | Must Have | System |
| BR-12 | Vehicle Management | License plate must follow Vietnamese format | Must Have | System |
| BR-13 | Vehicle Management | System normalizes plate format before storing | Must Have | System |
| BR-14 | Vehicle Ownership | One normalized plate belongs to one active customer | Must Have | System |
| BR-15 | Vehicle Ownership History | Ownership transfer history must be stored | Must Have | System |

---

## 3. Booking

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-16 | Advance Booking | Booking must follow tier booking window | Must Have | Customer |
| BR-17 | Advance Booking | Member 7d, Silver 10d, Gold 12d, Platinum 14d | Must Have | System |
| BR-18 | Advance Booking | Duplicate booking time for same vehicle is not allowed | Must Have | System |
| BR-19 | Advance Booking | Maximum 3 active bookings | Must Have | Customer |
| BR-20 | Slot Management | Slot cannot exceed shop capacity | Must Have | System |
| BR-21 | Slot Management | Booking only allowed for available slot | Must Have | System |
| BR-22 | Booking Status | Valid statuses: Pending, Confirmed, Checked-in, Completed, Cancelled, No-show | Must Have | System |
| BR-23 | Booking Cancellation | Only Pending/Confirmed bookings can be cancelled | Must Have | Customer |
| BR-24 | Booking Cancellation | Cancellation allowed at least 2 hours before booking | Must Have | Customer |
| BR-25 | Booking Management | Completed booking cannot be modified | Must Have | System |
| BR-26 | Booking History | Store createdAt timestamp | Must Have | System |
| BR-27 | No-show Policy | 2 no-shows in 30 days → booking suspension for 14 days | Should Have | System |
| BR-28 | Staff Check-in | Cancelled booking cannot check-in | Should Have | Staff |
| BR-29 | Staff Check-in | Late arrival over 15 minutes may become No-show | Should Have | Staff |
| BR-30 | Platinum Priority | Platinum customers receive booking priority | Should Have | System |

---

## 4. Wash Session

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-31 | Wash Session | Each wash session must have valid customerID | Must Have | System |
| BR-32 | Wash Session | Each wash session must have active staffID | Must Have | Staff |
| BR-33 | Wash Session | Wash session requires vehicleType, services, amount, timestamp | Must Have | System |
| BR-34 | Wash Session | Completed booking must have wash session | Must Have | System |
| BR-35 | Service Management | Service must exist in admin-configured service list | Must Have | Admin |
| BR-36 | Data Integrity | Completed wash session cannot be deleted | Must Have | System |
| BR-37 | Checkout | Amount must be greater than or equal to 0 | Must Have | System |
| BR-38 | Promotion Validation | Expired promotion cannot be applied | Should Have | System |
| BR-39 | Promotion Combination | stackable=false → system uses higher discount | Should Have | System |
| BR-40 | Promotion Combination | One promo code per session | Should Have | System |

---

## 5. Loyalty Points

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-41 | Loyalty Points | Points earned only after completed checkout | Must Have | System |
| BR-42 | Loyalty Points | Point earning formula is configurable | Must Have | System |
| BR-43 | Loyalty Points | Tier multipliers: Silver 1.5x, Gold 2x, Platinum 3x | Must Have | System |
| BR-44 | Loyalty Points | Points added after completion | Must Have | System |
| BR-45 | Loyalty Points | Cancelled/No-show bookings do not earn points | Must Have | System |
| BR-46 | Loyalty Points | Point balance cannot be negative | Must Have | System |
| BR-47 | Loyalty Points | Points expire after 12 months | Must Have | System |
| BR-48 | Reward Redemption | Refund/reversal flow for redeemed points | Must Have | System |
| BR-49 | Reward Redemption | Must have enough points to redeem | Must Have | Customer |
| BR-50 | Reward Redemption | Blocked customer cannot redeem | Must Have | System |
| BR-51 | Reward Redemption | Point redemption has explicit validity guard | Must Have | System |
| BR-52 | Reward Redemption | Reward types are defined and correct | Must Have | System |
| BR-53 | Reward Redemption | Redemption history exists in ledger | Must Have | System |

---

## 6. Tier Management

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-54 | Tier Management | Monthly tier review exists | Must Have | System |
| BR-55 | Tier Management | Tier thresholds match specification | Must Have | Admin |
| BR-56 | Tier Management | Downgrade uses rolling 12-month points | Must Have | System |
| BR-57 | Tier Definition | Valid tiers: Member, Silver, Gold, Platinum | Must Have | System |
| BR-58 | Tier Configuration | Tier requires minPoints, bookingWindowDays, discountPercent | Must Have | Admin |
| BR-59 | Tier Rule Change | New rules apply next monthly cycle | Must Have | Admin |
| BR-60 | Tier History | Tier upgrade/downgrade history must be stored | Must Have | System |

---

## 7. Promotion & Notification

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-61 | Promotion Management | Promotion requires valid startDate and endDate | Should Have | Admin |
| BR-62 | Promotion Validation | startDate cannot be after endDate | Should Have | System |
| BR-63 | Targeted Promotion | Promotion only visible to configured target tiers | Should Have | System |
| BR-64 | Tier Restriction | Silver+ promotions hidden from Member | Should Have | System |
| BR-65 | Promotion Authorization | Only Admin can manage promotions | Should Have | Admin |
| BR-66 | Point Expiry Notification | Notify 30 days and 7 days before expiration | Should Have | System |
| BR-67 | Booking Reminder | Send reminder 1 hour before booking | Should Have | System |
| BR-68 | Booking Confirmation | Send confirmation immediately after booking | Should Have | System |

---

## 8. Authorization

| BR ID | Function | Business Rule | Priority | Actor |
|-------|----------|---------------|----------|-------|
| BR-69 | Authorization | Only Staff can manage wash session | Must Have | Staff |
| BR-70 | Authorization | Staff cannot modify loyalty points | Must Have | Staff |
| BR-71 | Audit Log | Manual point adjustment requires immutable audit log | Must Have | System |
| BR-72 | Staff Permission | Staff only accesses checkout-related customer data | Must Have | Staff |
| BR-73 | Customer Permission | Customer only accesses own data | Must Have | Customer |
| BR-74 | Admin Permission | Admin can access all system data | Must Have | Admin |

---

## Tổng hợp theo Priority

| Priority | Số lượng |
|----------|----------|
| Must Have | 57 |
| Should Have | 17 |
| **Tổng** | **74** |

## Tổng hợp theo Module

| Module | Số lượng BR |
|--------|-------------|
| Account Registration | 9 (BR-01 → BR-09) |
| Vehicle Management | 6 (BR-10 → BR-15) |
| Booking | 15 (BR-16 → BR-30) |
| Wash Session | 10 (BR-31 → BR-40) |
| Loyalty Points | 13 (BR-41 → BR-53) |
| Tier Management | 7 (BR-54 → BR-60) |
| Promotion & Notification | 8 (BR-61 → BR-68) |
| Authorization | 6 (BR-69 → BR-74) |
