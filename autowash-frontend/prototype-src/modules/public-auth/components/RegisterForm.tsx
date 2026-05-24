import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCarwashStore } from "@/lib/carwash-store";
import { useLanguage } from "./LanguageSwitcher";

export function RegisterForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { requestRegistrationOtp } = useCarwashStore();

  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = phone.replace(/\D/g, "");

    if (!fullName.trim()) {
      toast.error(t("Full name is required.", "Vui lòng nhập họ và tên."));
      return;
    }
    if (!/^0\d{9}$/.test(normalizedPhone)) {
      toast.error(
        t(
          "Phone number must be 10 digits and start with 0.",
          "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.",
        ),
      );
      return;
    }
    if (password.length < 6) {
      toast.error(
        t("Password must be at least 6 characters.", "Mật khẩu phải có ít nhất 6 ký tự."),
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("Passwords do not match.", "Mật khẩu xác nhận không khớp."));
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const otp = requestRegistrationOtp({
        name: fullName.trim(),
        phone: normalizedPhone,
        countryCode: "+84",
        password,
      });
      toast.success(
        t(
          `OTP sent to ${normalizedPhone}. Prototype code: ${otp}`,
          `Đã gửi OTP đến ${normalizedPhone}. Mã prototype: ${otp}`,
        ),
      );
      navigate({ to: "/verify" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start registration.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("Full Name", "Họ và tên")}</Label>
        <div className="relative group">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder={t("Nguyen Van A", "Nguyễn Văn A")}
            className="h-12 border-border/60 bg-background/50 pl-10 transition-all focus:bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("Phone for OTP", "Số điện thoại nhận OTP")}</Label>
        <div className="relative group">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0901234567"
            inputMode="tel"
            className="h-12 border-border/60 bg-background/50 pl-10 transition-all focus:bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("Password", "Mật khẩu")}</Label>
        <div className="relative group">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="h-12 border-border/60 bg-background/50 pl-10 transition-all focus:bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("Confirm Password", "Xác nhận mật khẩu")}</Label>
        <div className="relative group">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            className="h-12 border-border/60 bg-background/50 pl-10 transition-all focus:bg-background"
          />
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1 text-muted-foreground">
        <div className="font-semibold text-foreground">
          {t("New customer defaults:", "Mặc định cho khách hàng mới:")}
        </div>
        <div>{t("Membership Tier: Member", "Hạng thành viên: Member")}</div>
        <div>{t("Available Points: 0", "Điểm hiện có: 0")}</div>
        <div>
          {t(
            "Phone must be verified by OTP before the account is activated.",
            "Cần xác nhận OTP trước khi kích hoạt tài khoản.",
          )}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
        disabled={submitting}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t("Sending OTP...", "Đang gửi OTP...")}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {t("Send OTP", "Gửi OTP")} <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </form>
  );
}
