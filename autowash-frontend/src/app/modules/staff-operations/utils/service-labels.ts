const SERVICE_NAME_MAP: Record<string, string> = {
  "Basic Wash": "Rửa cơ bản",
  "Interior Vacuum": "Hút bụi nội thất",
  "Premium Detail": "Chăm sóc cao cấp",
  "Ceramic Coating": "Phủ ceramic",
  "Express Exterior": "Rửa nhanh ngoại thất",
};

export function translateServiceLabel(label: string, lang: "en" | "vi") {
  if (lang === "en") return label;

  return label
    .split(" + ")
    .map((part) => SERVICE_NAME_MAP[part] ?? part)
    .join(" + ");
}
