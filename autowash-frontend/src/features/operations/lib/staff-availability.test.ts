import test from "node:test";
import assert from "node:assert/strict";
import {
  assignStaffToConfirmedBooking,
  getAvailableStaff,
  getStaffAvailability,
  NO_AVAILABLE_STAFF_REASON,
  requireAvailableStaff,
  StaffAssignmentError,
} from "./staff-availability.ts";

const staff = [
  { id: "s1", name: "Tran Bao Nam", status: "Active" },
  { id: "s2", name: "Hoang Lan", status: "Inactive" },
  { id: "s3", name: "Nguyen Van Hung", status: "Active" },
];

test("marks active staff with an active wash session as Busy", () => {
  const result = getStaffAvailability(staff, [
    { id: "ws1", staffId: "s1", status: "Queued" },
    { id: "ws2", staffId: "s3", status: "Completed" },
  ]);

  assert.deepEqual(
    result.map((item) => ({ id: item.id, availability: item.availability })),
    [
      { id: "s1", availability: "Busy" },
      { id: "s3", availability: "Available" },
    ],
  );
});

test("returns only employees who can be assigned to a new vehicle", () => {
  const result = getAvailableStaff(staff, [
    { id: "ws1", staffId: "s1", status: "Ready for Checkout" },
  ]);

  assert.deepEqual(
    result.map((item) => item.id),
    ["s3"],
  );
});

test("blocks check-in when every active employee is busy", () => {
  assert.throws(
    () =>
      requireAvailableStaff(staff, [
        { id: "ws1", staffId: "s1", status: "Queued" },
        { id: "ws2", staffId: "s3", status: "Ready for Checkout" },
      ]),
    /No available staff/,
  );
});

test("assigns the eligible staff member with the lowest wash count", () => {
  const result = assignStaffToConfirmedBooking("B100", [
    { staffId: "s1", name: "A", status: "active", dailyWashCount: 3, availability: true },
    { staffId: "s2", name: "B", status: "active", dailyWashCount: 2, availability: true },
    { staffId: "s3", name: "C", status: "active", dailyWashCount: 1, availability: true },
  ]);

  assert.deepEqual(result, {
    assignedStaffId: "s3",
    assignedStaffName: "C",
    washCountAtAssignment: 1,
    selectionMethod: "lowest_count",
    eligibleStaffCount: 3,
    reason: "SUCCESS",
  });
});

test("randomly breaks ties among the lowest-count eligible staff", () => {
  const result = assignStaffToConfirmedBooking(
    "B101",
    [
      { staffId: "s1", name: "A", status: "active", dailyWashCount: 3, availability: true },
      { staffId: "s2", name: "B", status: "active", dailyWashCount: 2, availability: true },
      { staffId: "s3", name: "C", status: "active", dailyWashCount: 2, availability: true },
    ],
    () => 0.75,
  );

  assert.deepEqual(result, {
    assignedStaffId: "s3",
    assignedStaffName: "C",
    washCountAtAssignment: 2,
    selectionMethod: "random_tiebreak",
    eligibleStaffCount: 3,
    reason: "SUCCESS",
  });
});

test("throws NO_AVAILABLE_STAFF when no active available staff exists", () => {
  assert.throws(
    () =>
      assignStaffToConfirmedBooking("B102", [
        { staffId: "s1", name: "A", status: "busy", dailyWashCount: 2, availability: false },
        { staffId: "s2", name: "B", status: "inactive", dailyWashCount: 0, availability: true },
      ]),
    (error: unknown) =>
      error instanceof StaffAssignmentError && error.reason === NO_AVAILABLE_STAFF_REASON,
  );
});
