import type { AdminSettingsState } from "../types/settings.types";

export const defaultSettings: AdminSettingsState = {
  business: {
    brandName: "AURA CAR CARE",
    hotline: "1900 5566",
    email: "support@auracarcare.vn",
    headquarter: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    operatingHours: "07:00 - 21:00 (Thứ 2 - Chủ nhật)",
  },
  cancellation: {
    freeCancelHoursBefore: 12,
    lateCancelFeePercent: 30,
    refundPolicy: "Hoàn 100% nếu hủy trước 12 giờ; sau đó tính 30% phí.",
  },
  point: {
    spendPerPoint: 10000,
    pointValueVnd: 200,
    minRedeemPoints: 200,
  },
  noShow: {
    thresholdCount: 3,
    cooldownDays: 14,
    autoSuspend: true,
  },
  localization: {
    supportedLanguages: ["vi-VN", "en-US"],
    defaultLanguage: "vi-VN",
    currencyCode: "VND",
    currencySymbol: "₫",
    numberFormat: "vi-VN",
  },
};
