# Backend 1: Identity, User Profile, Vehicle

## Muc Tieu

Backend nay phu trach danh tinh nguoi dung, xac thuc, ho so ca nhan, tuy chon nguoi dung va quan ly xe cua khach hang. Day la backend nen tach dau tien vi Backend 2 va Backend 3 deu can thong tin user, role, status va vehicle ownership.

Database dung chung voi 2 backend con lai. Backend nay la owner logic cua cac bang identity/customer, nhung cac bang van nam trong cung mot database.

## Pham Vi Chinh

- Dang ky, dang nhap, refresh token, logout.
- OTP verification cho tai khoan.
- Google OAuth ticket flow neu tiep tuc giu tinh nang hien tai.
- Lay va cap nhat profile nguoi dung.
- Lay va cap nhat preferences.
- CRUD xe cua khach hang.
- Kiem tra role/status cho cac backend khac thong qua JWT va/hoac internal lookup API.

## API Phu Trach

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/otp/send
POST   /api/v1/auth/otp/verify
POST   /api/v1/auth/login
POST   /api/v1/auth/forgot-password/request
POST   /api/v1/auth/forgot-password/reset
GET    /api/v1/auth/google/start
GET    /api/v1/auth/google/callback
GET    /api/v1/auth/google/tickets/{state}
POST   /api/v1/auth/google/tickets/exchange
POST   /api/v1/auth/google/tickets/link
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/users/preferences
PUT    /api/v1/users/preferences

POST   /api/v1/customers/vehicles
GET    /api/v1/customers/vehicles
GET    /api/v1/customers/vehicles/{vehicleId}
PUT    /api/v1/customers/vehicles/{vehicleId}
POST   /api/v1/customers/vehicles/{vehicleId}/set-primary
DELETE /api/v1/customers/vehicles/{vehicleId}
```

## Bang Database Chinh

```text
users
user_preferences
refresh_tokens
otp_verifications
vehicles
```

## Mapping Tu Backend Cu Sang Database Moi

```text
auth_users          -> users
user preferences    -> user_preferences
refresh_tokens      -> refresh_tokens
otp_records         -> otp_verifications
customer_vehicles   -> vehicles
```

Thay doi can luu y:

- `users.phone` va `users.email` deu unique.
- `users.role` dung enum `user_role`: `CUSTOMER`, `STAFF`, `ADMIN`.
- `users.status` dung enum `user_account_status`: `ACTIVE`, `BLOCKED`, `SUSPENDED`, `INACTIVE`.
- `vehicles.plate` hien unique toan he thong, khac voi logic cu co the unique theo customer.
- `otp_verifications` luu `code_hash`, khong luu plain OTP.

## Task Can Lam

### Task 1.1 - Doi Entity AuthUser Sang Users

- Tao/cap nhat entity map bang `users`.
- Doi ten field theo schema moi: `full_name`, `password_hash`, `avatar_url`.
- Map enum PostgreSQL cho `user_role` va `user_account_status`.
- Cap nhat repository query theo bang moi.

### Task 1.2 - Refactor Auth Flow

- Cap nhat register tao record trong `users`.
- Tao default `user_preferences` sau khi register thanh cong.
- Tao default `loyalty_accounts` co the thuc hien qua event/API sang Backend 2 hoac tam thoi transaction chung database neu van deploy chung.
- Cap nhat login theo phone/email neu frontend dang can email login.
- Cap nhat refresh/logout theo `refresh_tokens`.
- Bo sung forgot-password request/reset dung chung OTP verification.

### Task 1.3 - Refactor OTP

- Doi `otp_records` sang `otp_verifications`.
- Hash OTP vao `code_hash`.
- Ho tro `purpose`, `delivery_address`, `attempts`, `expires_at`, `verified_at`.
- Dung duoc cho register verification va forgot-password verification.

### Task 1.4 - Refactor User Profile va Preferences

- Cap nhat `UserProfileService` doc/ghi tu `users` va `user_preferences`.
- Dam bao profile response van tra du field frontend dang dung.
- Neu frontend can `tier`, lay tu Backend 2 hoac join/read `loyalty_accounts` trong giai do dung chung database.

### Task 1.5 - Refactor Vehicle

- Doi entity/repository tu `customer_vehicles` sang `vehicles`.
- Doi `owner_user_id` thanh `customer_id`.
- Kiem tra lai business rule bien so xe vi database moi unique global tren `plate`.
- Duy tri soft delete bang `status = DELETED` hoac `INACTIVE`; schema moi khong co `deleted_at`.
- Dam bao chi customer owner moi thao tac duoc xe.

### Task 1.6 - Security Shared Contract

- Chuan hoa JWT claim gom `userId`, `role`, `status`.
- Backend 2 va Backend 3 validate JWT bang cung secret/public key.
- Neu can internal endpoint, them endpoint chi noi bo de resolve user summary va vehicle ownership.

## Phu Thuoc Voi Backend Khac

Backend 2 can:

- Validate customer ton tai va active.
- Validate vehicle thuoc customer.
- Lay user tier neu tier khong nam trong JWT.

Backend 3 can:

- Validate staff/admin role.
- Lay staff list active.
- Lay account summary cho admin dashboard/reporting.

## Kiem Thu

- Auth integration test: register, OTP verify, login, refresh, logout.
- User profile test: get/update profile, get/update preferences.
- Vehicle test: create/list/detail/update/set primary/delete.
- Security test: blocked/suspended user khong duoc login hoac goi API can auth.
