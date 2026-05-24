import * as React from "react";
import { X, Phone, KeyRound, LockKeyhole, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "./LanguageSwitcher";

type Step = "phone" | "otp" | "newPassword" | "done";

// Mock OTP - always "123456" for demo
const MOCK_OTP = "123456";
const MOCK_PHONE = "0901234567";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!open) {
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
      setCountdown(0);
    }
  }, [open]);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone.trim())
      return toast.error(t("Enter your phone number.", "Vui lòng nhập số điện thoại."));
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("otp");
    setCountdown(60);
    toast.success(
      t(`OTP sent to ${phone}. Demo OTP: 123456`, `OTP đã gửi đến ${phone}. OTP demo: 123456`),
    );
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = otp.join("");
    if (entered.length < 6)
      return toast.error(t("Enter all 6 digits.", "Vui lòng nhập đủ 6 chữ số."));
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    if (entered !== MOCK_OTP) {
      toast.error(t("Incorrect OTP. Try 123456", "OTP sai. Thử 123456"));
      return;
    }
    setStep("newPassword");
    toast.success(t("OTP verified!", "Xác thực OTP thành công!"));
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6)
      return toast.error(
        t("Password must be at least 6 characters.", "Mật khẩu phải có ít nhất 6 ký tự."),
      );
    if (newPassword !== confirmPassword)
      return toast.error(t("Passwords do not match.", "Mật khẩu không khớp."));
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("done");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/50 bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div>
            <h2 className="text-lg font-bold">{t("Forgot Password", "Quên Mật Khẩu")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === "phone" && t("Enter your phone number", "Nhập số điện thoại")}
              {step === "otp" && t("Enter OTP code", "Nhập mã OTP")}
              {step === "newPassword" && t("Set new password", "Đặt mật khẩu mới")}
              {step === "done" && t("Password updated!", "Cập nhật thành công!")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 pt-4">
          {["phone", "otp", "newPassword", "done"].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`h-2 w-2 rounded-full transition-all ${
                  step === s
                    ? "bg-primary scale-125"
                    : ["phone", "otp", "newPassword", "done"].indexOf(step) > i
                      ? "bg-primary/60"
                      : "bg-border"
                }`}
              />
              {i < 3 && (
                <div
                  className={`h-0.5 flex-1 transition-all ${
                    ["phone", "otp", "newPassword", "done"].indexOf(step) > i
                      ? "bg-primary/60"
                      : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Phone */}
          {step === "phone" && (
            <>
              <div className="space-y-2">
                <Label>{t("Phone Number", "Số Điện Thoại")}</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={MOCK_PHONE}
                    className="pl-10 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(`Demo: use ${MOCK_PHONE}`, `Demo: dùng ${MOCK_PHONE}`)}
                </p>
              </div>
              <Button onClick={handleSendOtp} className="w-full h-12" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("Sending...", "Đang gửi...")}
                  </span>
                ) : (
                  t("Send OTP", "Gửi Mã OTP")
                )}
              </Button>
            </>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <>
              <div className="space-y-3">
                <Label>{t("Enter 6-digit OTP", "Nhập mã OTP 6 chữ số")}</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-12 w-12 rounded-xl border border-border/60 bg-background/50 text-center text-lg font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  ))}
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  {countdown > 0 ? (
                    <span>{t(`Resend in ${countdown}s`, `Gửi lại sau ${countdown}s`)}</span>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      className="text-primary hover:underline font-medium"
                    >
                      {t("Resend OTP", "Gửi lại OTP")}
                    </button>
                  )}
                </div>
              </div>
              <Button onClick={handleVerifyOtp} className="w-full h-12" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("Verifying...", "Đang xác thực...")}
                  </span>
                ) : (
                  t("Verify OTP", "Xác Nhận OTP")
                )}
              </Button>
            </>
          )}

          {/* Step 3: New Password */}
          {step === "newPassword" && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("New Password", "Mật Khẩu Mới")}</Label>
                  <div className="relative group">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("Confirm Password", "Xác Nhận Mật Khẩu")}</Label>
                  <div className="relative group">
                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleResetPassword} className="w-full h-12" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("Updating...", "Đang cập nhật...")}
                  </span>
                ) : (
                  t("Reset Password", "Đặt Lại Mật Khẩu")
                )}
              </Button>
            </>
          )}

          {/* Step 4: Done */}
          {step === "done" && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <div className="font-bold text-lg">
                  {t("Password Updated!", "Cập Nhật Thành Công!")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t(
                    "You can now sign in with your new password.",
                    "Bạn có thể đăng nhập bằng mật khẩu mới.",
                  )}
                </div>
              </div>
              <Button onClick={onClose} className="w-full h-12">
                {t("Back to Sign In", "Về Trang Đăng Nhập")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
