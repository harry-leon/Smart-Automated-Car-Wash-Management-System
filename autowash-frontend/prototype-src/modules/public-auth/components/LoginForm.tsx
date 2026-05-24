import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHomePath } from "@/lib/auth";
import { useCarwashStore } from "@/lib/carwash-store";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useLanguage } from "./LanguageSwitcher";

export function LoginForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { loginWithCredentials } = useCarwashStore();
  const [emailOrPhone, setEmailOrPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [forgotOpen, setForgotOpen] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      toast.error(t("Email or phone is required.", "Vui lòng nhập email hoặc số điện thoại."));
      return;
    }
    if (!password.trim()) {
      toast.error(t("Password is required.", "Vui lòng nhập mật khẩu."));
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const user = loginWithCredentials(emailOrPhone.trim(), password.trim());
    if (!user) {
      toast.error(
        t(
          "Incorrect credentials. Try customer@aura.vn / password123, or sign in with the phone number you registered.",
          "Sai thông tin. Thử customer@aura.vn / password123, hoặc đăng nhập bằng số điện thoại đã đăng ký.",
        ),
      );
      setSubmitting(false);
      return;
    }

    toast.success(t(`Welcome, ${user.displayName}!`, `Chào mừng, ${user.displayName}!`));
    navigate({ to: getHomePath(user.role) });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="emailOrPhone">{t("Email / Phone", "Email / Số điện thoại")}</Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="emailOrPhone"
              value={emailOrPhone}
              onChange={(event) => setEmailOrPhone(event.target.value)}
              placeholder="customer@aura.vn / 0901234567"
              className="h-12 border-border/60 bg-background/50 pl-10 transition-all focus:bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("Password", "Mật khẩu")}</Label>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("Forgot password?", "Quên mật khẩu?")}
            </button>
          </div>
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

        <div className="rounded-xl bg-accent/50 p-3 text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground">
            {t("Demo Accounts:", "Tài khoản demo:")}
          </div>
          <div>Customer: customer@aura.vn / password123</div>
          <div>Staff: staff@aura.vn / staff123</div>
          <div>Admin: admin@aura.vn / admin123</div>
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
              {t("Signing in...", "Đang đăng nhập...")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t("Sign In", "Đăng nhập")} <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
