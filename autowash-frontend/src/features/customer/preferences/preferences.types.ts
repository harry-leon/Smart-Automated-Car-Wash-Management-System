export type CustomerPreferences = {
  language: "VI" | "EN";
  theme: "LIGHT" | "DARK";
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export type UpdateCustomerPreferencesRequest = CustomerPreferences;

export type UpdateCustomerPreferencesResponse = {
  language: "VI" | "EN";
  theme: "LIGHT" | "DARK";
  notificationsEnabled: boolean;
  updatedAt: string;
};
