import type { Booking } from "./booking.types";

export type PointTransactionType = "EARN" | "REDEEM" | "BONUS" | "ADJUSTMENT" | "EXPIRE";

export interface PointTransaction {
  id: string;
  type: PointTransactionType;
  points: number;
  description: string;
  bookingCode?: string;
  createdAt: string;
}

export type WashHistoryRecord = Booking & {
  status: "COMPLETED";
};
