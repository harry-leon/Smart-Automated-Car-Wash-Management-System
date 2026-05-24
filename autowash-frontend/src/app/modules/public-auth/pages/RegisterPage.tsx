import { Link } from "@tanstack/react-router";
import { GuestLayout } from "@/components/guest-layout";
import { GuestOnly } from "@/components/route-guards";
import { RegisterForm } from "../components/RegisterForm";
import { useLanguage } from "../components/LanguageSwitcher";

function RegisterContent() {
  const { t } = useLanguage();

  return (
    <GuestOnly>
      <GuestLayout
        title={t("Create an account", "Tạo tài khoản")}
        description={t(
          "Join AURA CAR CARE to manage your vehicles, bookings, and earn loyalty rewards.",
          "Tham gia AURA CAR CARE để quản lý xe, đặt lịch và tích điểm thưởng.",
        )}
        footer={
          <div className="text-sm text-muted-foreground">
            {t("Already have an account?", "Đã có tài khoản?")}{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("Sign in instead", "Đăng nhập")}
            </Link>
          </div>
        }
      >
        <RegisterForm />
      </GuestLayout>
    </GuestOnly>
  );
}

export function RegisterPage() {
  return <RegisterContent />;
}
