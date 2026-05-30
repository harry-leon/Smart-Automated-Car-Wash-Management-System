# API Coverage: Customer, Admin, and Staff

Tài liệu này chỉ phân chia theo 2 nhóm:
- **Đã có API**
- **Chưa có API**

Nguồn đối chiếu:
- `docs/context/FRONTEND_CONTEXT.md`
- `docs/master/PROJECT.md`
- `docs/specs/autowash_api_contracts.md`

1. Đã có API

### Customer

- `GET /api/v1/customers/vehicles`
- `GET /api/v1/customers/vehicles/:vehicleId`
- `POST /api/v1/customers/vehicles`
- `PUT /api/v1/customers/vehicles/:vehicleId`
- `DELETE /api/v1/customers/vehicles/:vehicleId`
- `POST /api/v1/customers/vehicles/:vehicleId/set-primary`
- `GET /api/v1/customers/bookings`
- `GET /api/v1/customers/bookings/:bookingId`
- `POST /api/v1/customers/bookings`
- `POST /api/v1/customers/bookings/:bookingId/cancel`
- `GET /api/v1/loyalty/account`
- `GET /api/v1/loyalty/transactions`
- `GET /api/v1/customers/wash-history`
- `GET /api/v1/promotions/active`

### Staff / Shared Operations

- `GET /api/v1/operations/queue`
- `POST /api/v1/operations/sessions`
- `POST /api/v1/operations/sessions/:id/queue`
- `POST /api/v1/operations/sessions/:id/check-in`
- `POST /api/v1/operations/sessions/:id/start`
- `POST /api/v1/operations/sessions/:id/complete`

### Admin

- `GET /api/v1/admin/promotions`
- `GET /api/v1/admin/promotions/:promotionId`
- `POST /api/v1/admin/promotions`
- `PUT /api/v1/admin/promotions/:promotionId`
- `DELETE /api/v1/admin/promotions/:promotionId`

2. Chưa có API

### Customer

- `POST /api/v1/bookings/validate-voucher`
- `GET /api/v1/customers/notifications`
- `PUT /api/v1/customers/notifications/:notificationId/read`
- `GET /api/v1/customers/wash-tracking/active`
- `GET /api/v1/customers/wash-tracking/:washSessionId`
- `GET /api/v1/customers/combos`
- `POST /api/v1/customers/combos/:id/activate`
- `POST /api/v1/loyalty/redeem`
- `POST /api/v1/bookings/:bookingId/apply-points`

### Staff

- `GET /api/v1/admin/operations/dashboard`
- `GET /api/v1/admin/staff`
- `POST /api/v1/admin/staff`
- `PUT /api/v1/admin/staff/:id/status`
- `GET /api/v1/admin/staff/:id/workload`

### Admin

- `GET /api/v1/admin/dashboard/metrics`
- `GET /api/v1/admin/bookings`
- `GET /api/v1/admin/bookings/:id`
- `GET /api/v1/admin/accounts`
- `GET /api/v1/admin/customers/:id`
- `GET /api/v1/admin/customers/:id/vehicles`
- `GET /api/v1/admin/customers/:id/bookings`
- `GET /api/v1/admin/customers/:id/wash-sessions`
- `GET /api/v1/admin/customers/:id/point-transactions`
- `GET /api/v1/admin/customers/:id/tier-history`
- `PUT /api/v1/admin/customers/:customerId/status`
- `GET /api/v1/admin/reports/:reportType`
- `GET /api/v1/admin/packages`
- `POST /api/v1/admin/packages`
- `PUT /api/v1/admin/packages/:id`
- `DELETE /api/v1/admin/packages/:id`
- `GET /api/v1/admin/add-ons`
- `POST /api/v1/admin/add-ons`
- `PUT /api/v1/admin/add-ons/:id`
- `DELETE /api/v1/admin/add-ons/:id`
- `GET /api/v1/admin/combos`
- `POST /api/v1/admin/combos`
- `PUT /api/v1/admin/combos/:id`
- `DELETE /api/v1/admin/combos/:id`
- `GET /api/v1/admin/vouchers`
- `POST /api/v1/admin/vouchers`
- `PUT /api/v1/admin/vouchers/:id`
- `DELETE /api/v1/admin/vouchers/:id`

3. Ghi chú

- `GET /api/v1/operations/queue` đã được backend cho phép cho cả `STAFF` và `ADMIN`, nên có thể tái dùng cho các màn booking/operations theo phạm vi vai trò được phép.
- `GET /api/v1/customers/bookings` và `GET /api/v1/customers/bookings/:bookingId` là endpoint theo scope customer, không phải admin toàn cục.
- `GET /api/v1/admin/promotions` đã có backend và đã nối vào frontend.
- Các route placeholder hiện tại trên frontend chỉ nên giữ nếu chấp nhận chưa có backend contract tương ứng.
