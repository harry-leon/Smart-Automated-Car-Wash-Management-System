export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export const validationPatterns = {
  phone: /^0[0-9]{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  otp: /^[0-9]{6}$/,
  time: /^([01]\d|2[0-3]):[0-5]\d$/,
  plate: /^[0-9]{2}[A-Z]{1}-[0-9]{5,6}$/,
} as const;

export function validatePhone(value: string): ValidationResult {
  const phone = value.trim();

  if (!phone) {
    return { valid: false, message: "Phone number is required." };
  }

  if (!validationPatterns.phone.test(phone)) {
    return {
      valid: false,
      message: "Phone number must start with 0 and contain exactly 10 digits.",
    };
  }

  return { valid: true };
}

export function validateEmail(value: string, options: { required?: boolean } = {}): ValidationResult {
  const email = value.trim();

  if (!email) {
    return options.required
      ? { valid: false, message: "Email is required." }
      : { valid: true };
  }

  if (!validationPatterns.email.test(email)) {
    return { valid: false, message: "Email format is invalid." };
  }

  return { valid: true };
}

export function validateOtp(value: string): ValidationResult {
  const otp = value.trim();

  if (!otp) {
    return { valid: false, message: "OTP is required." };
  }

  if (!validationPatterns.otp.test(otp)) {
    return { valid: false, message: "OTP must contain exactly 6 digits." };
  }

  return { valid: true };
}

export function validatePassword(value: string): ValidationResult {
  if (!value) {
    return { valid: false, message: "Password is required." };
  }

  if (value.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }

  if (value.length > 128) {
    return { valid: false, message: "Password must be 128 characters or fewer." };
  }

  if (!/[A-Z]/.test(value)) {
    return { valid: false, message: "Password must include an uppercase letter." };
  }

  if (!/[a-z]/.test(value)) {
    return { valid: false, message: "Password must include a lowercase letter." };
  }

  if (!/[0-9]/.test(value)) {
    return { valid: false, message: "Password must include a number." };
  }

  if (!/[!@#$%^&*]/.test(value)) {
    return { valid: false, message: "Password must include a special character." };
  }

  return { valid: true };
}

export function validatePasswordConfirmation(password: string, confirmation: string): ValidationResult {
  if (!confirmation) {
    return { valid: false, message: "Password confirmation is required." };
  }

  if (password !== confirmation) {
    return { valid: false, message: "Password confirmation must match." };
  }

  return { valid: true };
}
