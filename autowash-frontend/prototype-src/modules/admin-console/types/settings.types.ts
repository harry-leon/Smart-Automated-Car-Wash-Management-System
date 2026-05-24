export interface BusinessInfo {
  brandName: string;
  hotline: string;
  email: string;
  headquarter: string;
  operatingHours: string;
}

export interface CancellationPolicy {
  freeCancelHoursBefore: number;
  lateCancelFeePercent: number;
  refundPolicy: string;
}

export interface PointConversion {
  spendPerPoint: number;
  pointValueVnd: number;
  minRedeemPoints: number;
}

export interface NoShowConfig {
  thresholdCount: number;
  cooldownDays: number;
  autoSuspend: boolean;
}

export interface LocalizationConfig {
  supportedLanguages: string[];
  defaultLanguage: string;
  currencyCode: string;
  currencySymbol: string;
  numberFormat: "vi-VN" | "en-US";
}

export interface AdminSettingsState {
  business: BusinessInfo;
  cancellation: CancellationPolicy;
  point: PointConversion;
  noShow: NoShowConfig;
  localization: LocalizationConfig;
}
