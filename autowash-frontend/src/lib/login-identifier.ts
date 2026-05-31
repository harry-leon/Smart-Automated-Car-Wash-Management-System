import { emailPattern, phonePattern } from "./validators.ts";

export function normalizeLoginIdentifier(value: string) {
  return value.trim().replace(/\s/g, "");
}

export function getLoginIdentifierValidationMessage(value: string) {
  if (value.length === 0) {
    return "Phone number or email is required.";
  }

  if (phonePattern.test(value) || emailPattern.test(value)) {
    return null;
  }

  return "Enter a valid Vietnamese phone number or email address.";
}
