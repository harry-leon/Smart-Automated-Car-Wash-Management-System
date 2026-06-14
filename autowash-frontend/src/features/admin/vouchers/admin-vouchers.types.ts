import type { PaginationMeta } from "@/features/admin/reports/admin-reporting.types";

export type AdminVoucher = {
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minAmount: number;
  expiresAt: string;
  active: boolean;
  newCustomerOnly: boolean;
  targetTiers: string[];
};

export type AdminVoucherRedemption = {
  transactionId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  voucherCode: string;
  pointsRedeemed: number;
  balanceAfter: number;
  redeemedAt: string;
};

export type AdminVoucherRedemptionPage = {
  items: AdminVoucherRedemption[];
  pagination: PaginationMeta;
};
