# Loyalty Center Manual Test (2026-05-31)

## Scope
- `GET /api/v1/loyalty/account`
- `GET /api/v1/loyalty/transactions`
- `POST /api/v1/loyalty/redeem`
- Customer pages:
  - `/customer/loyalty`
  - `/customer/loyalty/history`
  - `/customer/loyalty/redeem`

## Preconditions
1. Backend started with test profile data.
2. Frontend started with `npm run dev`.
3. Logged in as a `CUSTOMER` account with loyalty points available (>= 50 points).

## Test Steps and Results
1. Open `/customer/loyalty`.
   - Expected: account balance, tier, progress, recent transactions visible.
   - Actual: page loads account + recent transactions from API and renders loading/error states correctly.
   - Result: Pass.

2. Open `/customer/loyalty/history`.
   - Expected: transaction list from `GET /api/v1/loyalty/transactions`; earned points green, redeemed points red.
   - Actual: list renders newest-first with signed points and color by debit/credit.
   - Result: Pass.

3. Open `/customer/loyalty/redeem` and redeem valid points (example: 50).
   - Expected: call `POST /api/v1/loyalty/redeem`, show success feedback, balance updated.
   - Actual: success message shown with new balance; account/transaction queries refresh.
   - Result: Pass.

4. Redeem invalid points (below 50, above 200, greater than balance).
   - Expected: submit blocked or API error shown clearly.
   - Actual: inline validation blocks submit and API error feedback displays for server-side failures.
   - Result: Pass.

5. Re-open loyalty dashboard and history after redeem.
   - Expected: new balance and redeem transaction are visible.
   - Actual: updated balance/transaction appears without manual cache reset.
   - Result: Pass.
