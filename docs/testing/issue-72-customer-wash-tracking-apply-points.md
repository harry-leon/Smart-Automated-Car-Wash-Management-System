# Issue #72 - Customer Wash Tracking + Apply Points

## Scope verified

- `GET /api/v1/customers/wash-tracking/active`
- `GET /api/v1/customers/wash-tracking/{washSessionId}`
- `POST /api/v1/bookings/{bookingId}/apply-points`
- Customer UI route: `/customer/wash-tracking`
- Apply-points action from wash tracking and booking detail screens

## Manual test flow

1. Log in as a customer with an existing confirmed booking and loyalty balance.
2. Open `/customer/wash-tracking`.
   - If no active session exists, expect the empty state.
3. As staff, create a wash session from the confirmed booking.
4. Refresh `/customer/wash-tracking`.
   - Expect active session data: booking id, status, vehicle, package, staff, fee/points when available.
5. Open the booking detail page from the tracking screen.
6. Apply valid points, for example `50`.
   - Expect success feedback.
   - Booking final amount is reduced by `points * 1,000 VND`.
   - Loyalty balance is reduced.
7. Try applying points again to the same booking.
   - Expect conflict/error feedback and no second redemption.

## Edge cases

- Applying fewer than 50 points returns validation/business error.
- Applying more than 200 points returns validation/business error.
- Applying points with insufficient balance returns business error from loyalty rules.
- Accessing another customer's wash session returns 404.
- Completed sessions are not returned by `/active`.
