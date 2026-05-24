import type { PointTransaction } from "../types/history.types";

export const mockPointTransactions: PointTransaction[] = [
  {
    id: "pt-007",
    type: "REDEEM",
    points: -50,
    description: "Redeemed points into POINT50K voucher",
    createdAt: "2026-05-21T08:10:00+07:00",
  },
  {
    id: "pt-006",
    type: "EARN",
    points: 38,
    description: "Earned points from Detail Refresh wash",
    bookingCode: "CW-260517-004",
    createdAt: "2026-05-17T10:25:00+07:00",
  },
  {
    id: "pt-005",
    type: "BONUS",
    points: 300,
    description: "Gold tier monthly bonus",
    createdAt: "2026-05-15T09:00:00+07:00",
  },
  {
    id: "pt-004",
    type: "EARN",
    points: 0,
    description: "Combo wash completed with zero paid amount",
    bookingCode: "CW-260511-003",
    createdAt: "2026-05-11T17:35:00+07:00",
  },
  {
    id: "pt-003",
    type: "EXPIRE",
    points: 0,
    description: "Expired unused point voucher; points not refunded",
    bookingCode: "CW-260503-001",
    createdAt: "2026-05-03T15:05:00+07:00",
  },
  {
    id: "pt-002",
    type: "ADJUSTMENT",
    points: 50,
    description: "Manual service recovery adjustment",
    createdAt: "2026-04-28T20:10:00+07:00",
  },
  {
    id: "pt-001",
    type: "EARN",
    points: 9,
    description: "Earned points from Express Exterior wash",
    bookingCode: "CW-260421-009",
    createdAt: "2026-04-21T12:40:00+07:00",
  },
];
