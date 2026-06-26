Backend schema ↔ Entities — Báo cáo mapping chi tiết
Generated: 2026-06-23T

Tóm tắt ngắn: báo cáo liệt kê mỗi entity (Java) → cột DB tương ứng và nêu rõ các bất đồng/cảnh báo.

1) `User` ↔ table `users`
- Java fields:
  - `id` → `id` (uuid) ✔
  - `fullName` → `full_name` (varchar(100)) ✔
  - `phone` → `phone` (varchar(20), unique) ✔ (entity có `unique=true`)
  - `email` → `email` (varchar(255), unique) ✔
  - `passwordHash` → `password_hash` ✔
  - `avatarUrl` → `avatar_url` ✔
  - `role` (enum `UserRole`) → migration column `role` is varchar CHECK (...) (migration does NOT use SQL type `user_role` for column) — mismatch: entity uses `@Column(columnDefinition = "user_role")` but migration defines `role` as varchar with CHECK. Potential mapping issue; either use DB enum type in migration or change entity to map to varchar.
  - `status` (enum `UserStatus`, entity default `PENDING`) → migration `status` varchar NOT NULL DEFAULT 'ACTIVE' CHECK (only 'ACTIVE','BLOCKED','SUSPENDED','INACTIVE'). MISMATCH CRITICAL: `'PENDING'` not allowed by DB CHECK and default differs (entity/new user expects PENDING).
  - `createdAt`, `updatedAt` → `created_at`, `updated_at` ✔
- Action: align `status` domain (add `PENDING` to migration CHECK OR change entity default/usage). Decide to standardize on SQL enum or varchar+CHECK consistently.

2) `UserPreference` ↔ `user_preferences`
- Mapping OK: `user` ↔ `user_id` PK (mapped with `@MapsId`), language/theme/notifications match.

3) `RefreshToken` ↔ `refresh_tokens`
- `token` unique in both entity and DB ✔

4) `OtpVerification` ↔ `otp_verifications`
- `purpose` stored as varchar with CHECK in migration (values: REGISTRATION, EMAIL_REGISTRATION, PASSWORD_RESET, BOOKING_CONFIRMATION). Entity uses enum `OtpPurpose` — ensure enum constants match exact strings.

5) `Vehicle` ↔ `vehicles`
- Java fields:
  - `owner` → `customer_id` FK ✔
  - `plate` → `plate` varchar(20) UNIQUE NOT NULL — DB has UNIQUE, but entity `@Column(nullable=false, length=20)` lacks `unique=true`. MISMATCH: add `unique=true` to entity or accept DB-only uniqueness.
  - `type`, `brand`, `model`, `year` → `type`, `brand`, `model`, `vehicle_year` ✔ (note: entity field `year` maps to `vehicle_year`).
  - `status` (enum `VehicleStatus`) → migration defines `vehicle_status` CREATE TYPE but column is varchar with CHECK in migration (`'ACTIVE','INACTIVE','DELETED'`). Entity uses `columnDefinition = "vehicle_status"` — mismatch between entity request and actual column SQL.
- Action: prefer using DB enum type for column or remove `columnDefinition` from entity.

6) `Package`, `Service`, `PackageService`, `Combo`, `ComboService`
- Fields and composite PKs align with migration tables; checks on numeric constraints match. No major mismatches found in quick scan.

7) `Voucher` ↔ `vouchers`
- `code` unique ✔ (entity: unique=true)
- `discountType` mapped with `columnDefinition = "discount_type"` while migration column is varchar + CHECK ('PERCENT','FIXED_AMOUNT') — mismatch of SQL type usage vs entity expectation.
- Other numeric and date columns match.

8) `Promotion` / `PromotionTier` ↔ `promotions` / `promotion_tiers`
- `targeting_mode` migration uses varchar CHECK; entity uses enum with `columnDefinition = "promotion_targeting_mode"` — same pattern of potential mismatch.

9) `Booking` ↔ `bookings`
- `customer` → `customer_id` ✔
- `vehicle` → `vehicle_id` ✔
- `bookingType` entity uses `columnDefinition = "booking_type"` but migration column is varchar CHECK — mismatch (ensure SQL type exists or remove columnDefinition).
- `status` entity uses `columnDefinition = "booking_status"` while migration has varchar CHECK — same type-mapping inconsistency.
- Constraints: migration has CHECK to ensure package_id/combo_id consistent with booking_type — entity constructor sets bookingType accordingly; logic aligned.

10) `BookingOption`, `BookingPromotion`, `BookingStatusHistory` ↔ corresponding tables
- Mappings align; `booking_status_histories.new_status` is varchar in DB; entity `BookingStatusHistory` should use matching enum or string — verify enum usage if present.

11) `Payment` ↔ `payments`
- `booking` FK and unique constraint present in both ✔
- `method` and `status` entity fields use `columnDefinition` for SQL enum types while migration columns are varchar + CHECK — mapping mismatch. Ensure enum constants match DB CHECK strings.
- Numeric `amount` and timestamps match.

12) `WashSession` ↔ `wash_sessions` — IMPORTANT
- Entity `WashSession.status` uses enum `WashSessionStatus` and `columnDefinition = "wash_session_status"`.
- Migration `wash_sessions.status` column CHECK = ('PENDING','CHECKED_IN','IN_PROGRESS','COMPLETED','CANCELLED') — MISSING 'QUEUED'.
- Entity code calls `.queue()` and sets status `QUEUED` → INSERT/UPDATE will violate DB CHECK. CRITICAL: add 'QUEUED' to migration CHECK or remove/modify code.

13) `LoyaltyAccount`, `PointTransaction`, `TierHistory`
- `tier` / `type` enums: again entity requests named SQL enums while migration uses varchar+CHECK (values match). Ensure enum names/strings match exactly.
- `PointTransaction.id` uses IDENTITY (BIGSERIAL) in DB and `@GeneratedValue(strategy=IDENTITY)` in entity — OK.

14) `CustomerCombo`, `CustomerComboUsage` ↔ `customer_combos`, `customer_combo_usages`
- Mappings align; composite constraints and UNIQUE booking_id in usage table match.

15) `Notification` ↔ `notifications`
- `is_read` column vs entity field `read` maps to `is_read` — OK.

Chung (recommendations):
- Quy tắc thống nhất: chọn 1 trong 2 cách:
  1) Sử dụng SQL ENUM types (CREATE TYPE) và thay đổi migration để khai báo cột dùng enum type (e.g. `role user_role NOT NULL`) — sau đó entity `columnDefinition = "user_role"` hợp lý; hoặc
  2) Giữ varchar + CHECK trong migration và xóa `JdbcTypeCode(NAMED_ENUM)`/`columnDefinition` trên entity, map enum ↔ String bằng `@Enumerated(EnumType.STRING)` (không yêu cầu named SQL type).
- Sửa ngay các mismatch nghiêm trọng:
  - `users.status`: thêm 'PENDING' vào migration CHECK hoặc thay đổi entity default.
  - `wash_sessions.status`: thêm 'QUEUED' vào migration CHECK hoặc thay đổi code để không dùng `QUEUED`.
  - `Vehicle.plate`: thêm `unique=true` vào entity hoặc chấp nhận uniqueness chỉ ở DB (tốt nhất là phản ánh ở entity).
- Đảm bảo mọi enum Java có giá trị chuỗi khớp chính xác với các giá trị trong CHECK nếu tiếp tục dùng varchar+CHECK.

File được lưu tại: docs/backend-schema-entity-mapping-report.md

Bạn muốn tôi: (1) tự động patch entity hoặc migration cho những sửa nhỏ (ví dụ thêm `unique=true` cho `Vehicle.plate` và thêm `'QUEUED'` vào migration), hoặc (2) tạo báo cáo CSV chi tiết từng field → column để dễ review, hoặc (3) chạy `mvn test` để thu lỗi runtime?
