export const phonePattern = /^0[0-9]{9}$/;
export const otpPattern = /^[0-9]{6}$/;
export const platePattern = /^[0-9]{2}[A-Z]{1}-[0-9]{5,6}$/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;
export const voucherCodePattern = /^[A-Z0-9_-]+$/;
export const voucherCodeFormatMessage =
  "Mã giảm giá phải viết hoa và không chứa khoảng trắng.";
export const promotionNameFormatMessage =
  "Tên promotion phải viết hoa và không chứa khoảng trắng.";

export function sanitizeVoucherCodeInput(value: string): string {
  return value.replace(/\s/g, "").toUpperCase();
}

export function sanitizePromotionNameInput(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .toUpperCase();
}

export function getVoucherCodeFormatError(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  if (!voucherCodePattern.test(normalized)) {
    return voucherCodeFormatMessage;
  }

  return null;
}

export function getPromotionNameFormatError(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  if (!voucherCodePattern.test(normalized)) {
    return promotionNameFormatMessage;
  }

  return null;
}
