export function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " d";
}
