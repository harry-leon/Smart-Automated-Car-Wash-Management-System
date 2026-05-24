import { useLanguage } from "./LanguageSwitcher";

export function PublicFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden p-0.5">
                <img
                  src="/logo.png"
                  alt="AURA CAR CARE"
                  className="h-full w-full rounded-[10px] object-cover"
                />
              </div>
              <span className="font-bold">AURA CAR CARE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(
                "Professional car wash with German technology in Ho Chi Minh City.",
                "Rửa xe chuyên nghiệp công nghệ Đức tại TP.HCM.",
              )}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">{t("Quick Links", "Liên Kết Nhanh")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  {t("Services", "Dịch Vụ")}
                </a>
              </li>
              <li>
                <a href="#combos" className="hover:text-foreground transition-colors">
                  {t("Monthly Packages", "Gói Tháng")}
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-foreground transition-colors">
                  {t("Customer Reviews", "Đánh Giá Khách Hàng")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-3">{t("Contact", "Liên Hệ")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                📍 {t("123 Nguyen Van Linh, District 7, HCMC", "123 Nguyễn Văn Linh, Q.7, TP.HCM")}
              </li>
              <li>📞 0901 234 567</li>
              <li>✉️ contact@auracarcare.vn</li>
              <li>🕐 {t("Mon–Sun: 7:00 AM – 8:00 PM", "T2–CN: 7:00 – 20:00")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          © {year} AURA CAR CARE. {t("All rights reserved.", "Bảo lưu mọi quyền.")}
        </div>
      </div>
    </footer>
  );
}
