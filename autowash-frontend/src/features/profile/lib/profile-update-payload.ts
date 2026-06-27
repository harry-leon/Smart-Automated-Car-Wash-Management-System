import type { UpdateUserProfileRequest } from "@/entities/users";

type ProfileUpdateDraft = {
  fullName: string;
  email: string;
  phone: string;
};

export function buildUpdateUserProfileRequest(
  form: ProfileUpdateDraft,
): UpdateUserProfileRequest {
  const normalizedEmail = form.email.trim();
  const normalizedPhone = form.phone.trim();

  return {
    fullName: form.fullName.trim(),
    email: normalizedEmail.length > 0 ? normalizedEmail : null,
    phone: normalizedPhone.length > 0 ? normalizedPhone : null,
  };
}
