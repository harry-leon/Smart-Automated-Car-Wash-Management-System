import type { UpdateUserProfileRequest } from "@/features/customer/profile/profile.types";

type ProfileUpdateDraft = {
  fullName: string;
  email: string;
  phone: string;
};

export function buildUpdateUserProfileRequest(
  form: ProfileUpdateDraft,
): UpdateUserProfileRequest {
  const normalizedEmail = form.email.trim();

  return {
    fullName: form.fullName.trim(),
    email: normalizedEmail.length > 0 ? normalizedEmail : null,
    phone: form.phone.trim(),
  };
}
