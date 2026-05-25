export const phonePattern = /^0[0-9]{9}$/;
export const otpPattern = /^[0-9]{6}$/;
export const platePattern = /^[0-9]{2}[A-Z]{1}-[0-9]{5,6}$/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;
