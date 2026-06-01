# Admin Growth Console Manual Test Notes

Date: 2026-05-31

Scope covered:
- Admin dashboard metrics endpoint and widget integration
- Admin promotions list/detail/create/update/delete flows

Automated verification:
- Backend targeted tests:
  - `AdminDashboardMetricsControllerIntegrationTest`
  - `PromotionControllerIntegrationTest`
- Backend full suite:
  - `mvn -q test`
- Backend package build:
  - `mvn -q package -DskipTests`
- Frontend unit tests:
  - `npm test`
- Frontend production build:
  - `npm run build`

Manual/API verification against running local services:
1. Logged in with seeded admin account:
   - `POST http://localhost:8080/api/v1/auth/login`
   - identifier: `admin@autowash.com`
   - password: `Password123@`
2. Verified dashboard metrics:
   - `GET http://localhost:8080/api/v1/admin/dashboard/metrics`
   - Result: `200 OK`
   - Sample response:
     - `totalBookings: 33`
     - `totalRevenue: 2220000`
     - `totalCustomers: 9`
     - `activePromotions: 6`
3. Verified promotions list:
   - `GET http://localhost:8080/api/v1/admin/promotions?page=1&limit=5`
   - Result: `200 OK`
4. Verified promotions CRUD:
   - `POST /api/v1/admin/promotions` returned `201 Created`
   - `GET /api/v1/admin/promotions/{promotionId}` returned created record
   - `PUT /api/v1/admin/promotions/{promotionId}` returned updated record
   - `DELETE /api/v1/admin/promotions/{promotionId}` soft-deleted record with `status=INACTIVE`
5. Verified frontend routes respond:
   - `GET http://localhost:3000/admin/dashboard` returned `200`
   - `GET http://localhost:3000/admin/promotions` returned `200`

UI behavior checked in code/build:
- Dashboard metrics widget shows loading and error states before rendering KPI values.
- Promotions page supports loading, error, empty, create, edit, delete, and detail refresh before edit submit.

Notes:
- Local ports `3000` and `8080` were already occupied by running app instances during verification, so manual API checks were executed against those active services.
- GitHub Project card update could not be verified from this environment because the configured GitHub connector does not have access to the repository.
