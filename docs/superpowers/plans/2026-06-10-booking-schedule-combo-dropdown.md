# Booking Schedule and Combo Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let customers place bookings for today, disable only past time slots for the selected day, and switch combo selection to a dropdown in the combo checkout flow.

**Architecture:** Keep the booking date/time rules in the existing booking UI layer so the backend contract stays unchanged. Add a small reusable date/time helper that computes the current local date and filters out past time slots for "today" only. Replace the combo card grid with a compact dropdown while preserving the existing summary and owned-combo behavior.

**Tech Stack:** Next.js App Router, React, TypeScript, existing shadcn/ui primitives, existing booking service/types.

---

### Task 1: Add local date and time-slot helpers

**Files:**
- Modify: `D:/CarWash/autowash-frontend/src/lib/booking-format.ts`

- [ ] **Step 1: Add helpers for local date input and time-slot availability**

```ts
export function formatLocalDateInput(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getAvailableBookingTimeSlots(
  bookingDate: string,
  slots: readonly string[],
) {
  const today = formatLocalDateInput(0);
  if (bookingDate !== today) {
    return slots.map((slot) => ({ time: slot, disabled: false }));
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.map((slot) => {
    const [hours, minutes] = slot.split(":").map(Number);
    const slotMinutes = hours * 60 + minutes;
    return { time: slot, disabled: slotMinutes < currentMinutes };
  });
}
```

- [ ] **Step 2: Run a focused TypeScript compile check**

Run: `npm run build -- --no-lint`
Expected: The new helpers compile, and any remaining errors will be unrelated to these functions.

### Task 2: Allow today in the booking form and disable past times only

**Files:**
- Modify: `D:/CarWash/autowash-frontend/src/components/customer-booking-form.tsx`

- [ ] **Step 1: Replace the tomorrow-only date default with today**

```ts
useEffect(() => {
  if (!draft.bookingDate) {
    updateDraft({ bookingDate: formatLocalDateInput(0) });
  }
}, [draft.bookingDate, updateDraft]);
```

- [ ] **Step 2: Bind the date input minimum to today**

```tsx
<input
  type="date"
  min={formatLocalDateInput(0)}
  value={draft.bookingDate}
  onChange={(event) => updateDraft({ bookingDate: event.target.value })}
  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
/>
```

- [ ] **Step 3: Render time slots with disabled past entries for today only**

```tsx
const availableTimeSlots = getAvailableBookingTimeSlots(draft.bookingDate, BOOKING_TIME_SLOTS);

<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  {availableTimeSlots.map(({ time, disabled }) => (
    <button
      key={time}
      type="button"
      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
        draft.bookingTime === time
          ? "border-slate-900 bg-slate-900 text-white"
          : disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-300 bg-white hover:border-slate-500"
      }`}
      disabled={disabled}
      onClick={() => updateDraft({ bookingTime: time })}
    >
      {time}
    </button>
  ))}
</div>
```

- [ ] **Step 4: Keep validation aligned with the disabled states**

```ts
if (!draft.bookingDate) {
  errors.bookingDate = "Please choose a booking date.";
}
if (!draft.bookingTime) {
  errors.bookingTime = "Please choose a booking time.";
}
```

- [ ] **Step 5: Verify the form behavior manually**

Run:
`npm run dev`

Check:
`/customer/bookings/new`

Expected:
- Today is selectable.
- Past time slots for today are disabled and visually muted.
- Future time slots remain selectable.

### Task 3: Convert combo selection to a dropdown

**Files:**
- Modify: `D:/CarWash/autowash-frontend/src/components/customer-combos/customer-combo-checkout-page.tsx`

- [ ] **Step 1: Replace the combo card list with a dropdown using the existing select primitive**

```tsx
<Select value={comboId} onValueChange={setComboId}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select a combo" />
  </SelectTrigger>
  <SelectContent>
    {combos.map((combo) => (
      <SelectItem key={combo.comboId} value={combo.comboId}>
        {combo.name} · {formatBookingCurrency(combo.basePrice)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

- [ ] **Step 2: Preserve the owned-combo info and summary below the dropdown**

```tsx
{ownedCombo ? (
  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
    Owned combo · {ownedCombo.remainingUsages} usages left · expires{" "}
    {new Date(ownedCombo.expiresAt).toLocaleDateString("vi-VN")}
  </div>
) : null}
```

- [ ] **Step 3: Keep the rest of the checkout payload unchanged**

```ts
const payload = {
  ...existingPayload,
  comboId,
};
```

- [ ] **Step 4: Verify combo checkout still opens and submits**

Run:
`npm run dev`

Check:
`/customer/combos/combo_002/checkout`

Expected:
- Combo selection is a dropdown.
- Selecting a combo updates the summary.
- Checkout submission still uses the same API payload.

### Task 4: Final verification

**Files:**
- None

- [ ] **Step 1: Reopen the two affected routes**

Check:
- `/customer/bookings/new`
- `/customer/combos/combo_002/checkout`

- [ ] **Step 2: Confirm there are no new console errors from the changes**

Expected:
- No validation failure for booking date when booking today.
- No module or render regressions in the combo checkout flow.

- [ ] **Step 3: Commit the finished change**

```bash
git add D:/CarWash/autowash-frontend/src/lib/booking-format.ts D:/CarWash/autowash-frontend/src/components/customer-booking-form.tsx D:/CarWash/autowash-frontend/src/components/customer-combos/customer-combo-checkout-page.tsx
git commit -m "feat: allow same-day booking and dropdown combo selection"
```
