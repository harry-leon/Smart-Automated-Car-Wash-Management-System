import { Link } from "@tanstack/react-router";
import { GuestLayout } from "@/components/guest-layout";
import { GuestOnly } from "@/components/route-guards";
import { LoginForm } from "../components/LoginForm";
import { useLanguage } from "../components/LanguageSwitcher";

function LoginContent() {
  const { t } = useLanguage();

  return (
    <GuestOnly>
      <GuestLayout
        title={t("Welcome back", "Chào mừng trở lại")}
        description={t(
          "Sign in to your account to continue your journey with AURA CAR CARE.",
          "Đăng nhập để tiếp tục hành trình cùng AURA CAR CARE.",
        )}
        footer={
          <div className="text-sm text-muted-foreground">
            {t("Don't have an account?", "Chưa có tài khoản?")}{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("Create an account", "Đăng ký ngay")}
            </Link>
          </div>
        }
      >
        <LoginForm />
      </GuestLayout>
    </GuestOnly>
  );
}

export function LoginPage() {
  return <LoginContent />;
}
