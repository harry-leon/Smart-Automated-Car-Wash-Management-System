"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Eye,
  EyeOff,
  Gauge,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "@/shared/components/ui/button";
import { useCustomerLogin, useCustomerRegister, useSendCustomerOtp, useVerifyCustomerOtp } from "@/features/auth/hooks/use-auth";
import { getDisplayErrorMessage } from "@/shared/lib/api-errors";
import { getAuthRedirectPath } from "@/features/auth/lib/auth-session";
import { getLoginIdentifierValidationMessage, normalizeLoginIdentifier } from "@/features/auth/lib/login-identifier";
import { getPasswordVisibilityState } from "@/features/auth/lib/password-visibility";
import { cn } from "@/shared/lib/utils";
import { emailPattern, otpPattern, passwordPattern, phonePattern } from "@/shared/lib/validators";
import { useAuthStore } from "@/features/auth/store/auth.store";

type AuthMode = "login" | "register" | "otp";
type AuthLanguage = "vi" | "en";

type ModernAuthPopupModalProps = {
  mode: AuthMode;
  otpEmail: string;
  setOtpEmail: (email: string) => void;
  setMode: (mode: AuthMode | null) => void;
  onClose: () => void;
  language: AuthLanguage;
  setLanguage: (lang: AuthLanguage) => void;
};

const OTP_LENGTH = 6;

const AUTH_COPY = {
  vi: {
    badge: "Chuáº©n chÄƒm sÃ³c Aura",
    heroEyebrow: "",
    heroTitleA: "Há»‡ thá»‘ng quáº£n lÃ½",
    heroTitleB: "rá»­a xe thÃ´ng minh",
    heroTitleC: "",
    heroDescription: "Nhanh chÃ³ng. Minh báº¡ch. Hiá»‡n Ä‘áº¡i.",
    featureA: "Äáº·t lá»‹ch thÃ´ng minh",
    featureB: "Theo dÃµi thá»i gian thá»±c",
    featureC: "Nhanh chÃ³ng & minh báº¡ch",
    close: "ÄÃ³ng",
    language: "NgÃ´n ngá»¯",
    loginTitle: "ÄÄƒng nháº­p",
    loginDescription: "ChÃ o má»«ng báº¡n quay láº¡i. Tiáº¿p tá»¥c hÃ nh trÃ¬nh chÄƒm sÃ³c xe cá»§a báº¡n.",
    identifierLabel: "Sá»‘ Ä‘iá»‡n thoáº¡i hoáº·c email",
    identifierPlaceholder: "0901234567 hoáº·c you@gmail.com",
    passwordLabel: "Máº­t kháº©u",
    passwordPlaceholder: "Nháº­p máº­t kháº©u",
    forgotPassword: "QuÃªn máº­t kháº©u?",
    loginButton: "ÄÄƒng nháº­p ngay",
    loggingIn: "Äang Ä‘Äƒng nháº­p...",
    googleLoginButton: "ÄÄƒng nháº­p báº±ng Google",
    googleRegisterButton: "Ðang ký b?ng Google",
    quickDivider: "Tiáº¿p tá»¥c nhanh vá»›i",
    noAccount: "ChÆ°a cÃ³ tÃ i khoáº£n?",
    registerLink: "ÄÄƒng kÃ½ thÃ nh viÃªn",
    loginPasswordError: "Máº­t kháº©u tá»‘i thiá»ƒu 8 kÃ½ tá»±.",
    registerTitle: "ÄÄƒng kÃ½ thÃ nh viÃªn",
    registerDescription: "Táº¡o tÃ i khoáº£n Ä‘á»ƒ Ä‘áº·t lá»‹ch nhanh, quáº£n lÃ½ xe vÃ  nháº­n Æ°u Ä‘Ã£i riÃªng.",
    nameLabel: "Há» vÃ  tÃªn",
    namePlaceholder: "Nguyá»…n VÄƒn A",
    phoneLabel: "Sá»‘ Ä‘iá»‡n thoáº¡i",
    phonePlaceholder: "0901234567",
    emailLabel: "Email",
    optional: "khÃ´ng báº¯t buá»™c",
    emailPlaceholder: "your@gmail.com",
    confirmPasswordLabel: "XÃ¡c nháº­n",
    registerButton: "Táº¡o tÃ i khoáº£n",
    registering: "Äang Ä‘Äƒng kÃ½...",
    hasAccount: "ÄÃ£ cÃ³ tÃ i khoáº£n?",
    backToLogin: "ÄÄƒng nháº­p",
    nameError: "Vui lÃ²ng nháº­p há» tÃªn.",
    phoneError: "Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡.",
    emailError: "Email khÃ´ng há»£p lá»‡.",
    passwordRule: "Cáº§n chá»¯ hoa, chá»¯ thÆ°á»ng, sá»‘, kÃ½ tá»± Ä‘áº·c biá»‡t vÃ  tá»‘i thiá»ƒu 8 kÃ½ tá»±.",
    confirmError: "Máº­t kháº©u khÃ´ng khá»›p.",
    otpTitle: "XÃ¡c nháº­n OTP",
    otpDescription: "Nháº­p mÃ£ 6 chá»¯ sá»‘ Ä‘Ã£ gá»­i Ä‘áº¿n",
    otpExpires: "Háº¿t háº¡n sau",
    otpCanResend: "Báº¡n cÃ³ thá»ƒ gá»­i láº¡i mÃ£.",
    otpSending: "Äang gá»­i...",
    otpSendAgain: "Gá»­i láº¡i mÃ£",
    otpBack: "Quay láº¡i",
    otpVerify: "XÃ¡c thá»±c",
    otpVerifying: "Äang xÃ¡c thá»±c...",
    eyebrowLogin: "Quyá»n truy cáº­p AURA",
    eyebrowRegister: "ThÃ nh viÃªn AURA",
    brandSubtitle: "Rá»­a xe vÃ  chÄƒm sÃ³c cao cáº¥p",
    brandTitleA: "Há»‡ thá»‘ng",
    brandTitleB: "chÄƒm sÃ³c",
    brandTitleC: "xe hÆ¡i tá»‘i tÃ¢n",
    brandDesc: "Rá»­a khÃ´ng cháº¡m, cháº©n Ä‘oÃ¡n gáº§m tá»± Ä‘á»™ng, gloss-sealant Ä‘áº³ng cáº¥p. Äáº·t lá»‹ch trong 30 giÃ¢y.",
    otpVerifyBtn: "XÃ¡c Thá»±c & HoÃ n Táº¥t",
    otpBackBtn: "Trá»Ÿ láº¡i",
    orContinueWith: "Hoáº·c tiáº¿p tá»¥c vá»›i",
  },
  en: {
    badge: "Aura Premium Detailing",
    heroEyebrow: "",
    heroTitleA: "Smart Automated",
    heroTitleB: "Car Wash System",
    heroTitleC: "",
    heroDescription: "Fast. Transparent. Modern.",
    featureA: "Smart Booking",
    featureB: "Real-time Tracking",
    featureC: "Quick & Transparent",
    close: "Close",
    language: "Language",
    loginTitle: "Sign In",
    loginDescription: "Welcome back. Continue your vehicle care journey.",
    identifierLabel: "Phone number or email",
    identifierPlaceholder: "0901234567 or you@gmail.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    loginButton: "Sign In Now",
    loggingIn: "Signing in...",
    quickDivider: "Or continue with",
    noAccount: "Don't have an account?",
    registerLink: "Sign Up Now",
    loginPasswordError: "Password must be at least 8 characters.",
    googleLoginButton: "Sign in with Google",
    googleRegisterButton: "Sign up with Google",
    registerTitle: "Create Account",
    registerDescription: "Sign up to book faster, manage your cars, and receive exclusive offers.",
    nameLabel: "Full Name",
    namePlaceholder: "John Doe",
    phoneLabel: "Phone Number",
    phonePlaceholder: "0901234567",
    emailLabel: "Email",
    optional: "optional",
    emailPlaceholder: "your@gmail.com",
    confirmPasswordLabel: "Confirm Password",
    registerButton: "Register",
    registering: "Registering...",
    hasAccount: "Already have an account?",
    backToLogin: "Sign In",
    nameError: "Please enter your full name.",
    phoneError: "Invalid phone number.",
    emailError: "Invalid email address.",
    passwordRule: "Requires uppercase, lowercase, numbers, special characters, and min 8 characters.",
    confirmError: "Passwords do not match.",
    otpTitle: "Verify OTP",
    otpDescription: "Enter the 6-digit code sent to",
    otpExpires: "Expires in",
    otpCanResend: "You can resend the code.",
    otpSending: "Sending...",
    otpSendAgain: "Resend Code",
    otpBack: "Back",
    otpVerify: "Verify",
    otpVerifying: "Verifying...",
    eyebrowLogin: "AURA Access",
    eyebrowRegister: "AURA Member",
    brandSubtitle: "Premium Car Care & Wash",
    brandTitleA: "Ultimate",
    brandTitleB: "Car Care",
    brandTitleC: "Platform",
    brandDesc: "Touchless wash, undercarriage scan, premium gloss sealant. Book in 30 seconds.",
    otpVerifyBtn: "Verify & Complete",
    otpBackBtn: "Back",
    orContinueWith: "Or continue with",
  },
} satisfies Record<AuthLanguage, Record<string, string>>;

export function ModernAuthPopupModal({
  mode,
  otpEmail,
  setOtpEmail,
  setMode,
  onClose,
  language,
  setLanguage,
}: ModernAuthPopupModalProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const copy = AUTH_COPY[language];

  useEffect(() => {
    if (accessToken && user) {
      onClose();
      router.replace(getAuthRedirectPath(user.role));
    }
  }, [accessToken, onClose, router, user]);

  const loginMutation = useCustomerLogin();
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isLoginPassVisible, setIsLoginPassVisible] = useState(false);
  const loginPassVisibility = getPasswordVisibilityState(isLoginPassVisible);
  const loginIdNormalized = normalizeLoginIdentifier(loginId);
  const loginIdError = getLoginIdentifierValidationMessage(loginIdNormalized);
  const loginPassError = loginPass.length > 0 && loginPass.length < 8 ? copy.loginPasswordError : null;
  const canLoginSubmit = loginIdError === null && loginPass.length >= 8 && !loginMutation.isPending;
  const loginErrorMessage = loginMutation.error ? getDisplayErrorMessage(loginMutation.error) : null;

  const registerMutation = useCustomerRegister();
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");
  const [isRegPassVisible, setIsRegPassVisible] = useState(false);
  const [isRegConfirmVisible, setIsRegConfirmVisible] = useState(false);
  const regPassVisibility = getPasswordVisibilityState(isRegPassVisible);
  const regConfirmVisibility = getPasswordVisibilityState(isRegConfirmVisible);
  const regNameError = regName.length > 0 && regName.trim().length === 0 ? copy.nameError : null;
  const regPhoneError = regPhone.length > 0 && !phonePattern.test(regPhone) ? copy.phoneError : null;
  const regEmailError = regEmail.length > 0 && !emailPattern.test(regEmail) ? copy.emailError : null;
  const regPassError = regPass.length > 0 && !passwordPattern.test(regPass) ? copy.passwordRule : null;
  const regConfirmError = regConfirmPass.length > 0 && regConfirmPass !== regPass ? copy.confirmError : null;
  const canRegisterSubmit = useMemo(
    () =>
      regName.trim().length > 0 &&
      phonePattern.test(regPhone) &&
      emailPattern.test(regEmail) &&
      passwordPattern.test(regPass) &&
      regConfirmPass === regPass &&
      !registerMutation.isPending,
    [regConfirmPass, regEmail, regName, regPass, regPhone, registerMutation.isPending],
  );
  const registerErrorMessage = registerMutation.error ? getDisplayErrorMessage(registerMutation.error) : null;

  const sendOtpMutation = useSendCustomerOtp();
  const verifyOtpMutation = useVerifyCustomerOtp();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [lastOtpExpiry, setLastOtpExpiry] = useState<number | null>(null);
  const hasAutoSentRef = useRef(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpValue = digits.join("");
  const readyVerify = otpPattern.test(otpValue) && emailPattern.test(otpEmail) && secondsLeft > 0;
  const otpVerifyError = verifyOtpMutation.error ? getDisplayErrorMessage(verifyOtpMutation.error) : null;

  useEffect(() => {
    if (!lastOtpExpiry) return;
    const timer = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((lastOtpExpiry - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastOtpExpiry]);

  const handleSendOtp = useCallback(async () => {
    if (!emailPattern.test(otpEmail)) return;
    const response = await sendOtpMutation.mutateAsync({ email: otpEmail });
    setLastOtpExpiry(Date.now() + response.otpExpiresIn * 1000);
    setDigits(Array(OTP_LENGTH).fill(""));
    otpInputRefs.current[0]?.focus();
  }, [otpEmail, sendOtpMutation]);

  useEffect(() => {
    if (mode !== "otp" || hasAutoSentRef.current || !emailPattern.test(otpEmail)) return;
    hasAutoSentRef.current = true;
  }, [mode, otpEmail]);

  const handleLoginSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canLoginSubmit) return;
    loginMutation.mutate({
      identifier: loginIdNormalized,
      password: loginPass,
      rememberMe: true,
    });
  };

  const handleRegisterSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canRegisterSubmit) return;
    registerMutation.mutate(
      {
        fullName: regName.trim(),
        phone: regPhone,
        email: regEmail,
        password: regPass,
        passwordConfirm: regConfirmPass,
      },
      {
        onSuccess: (response) => {
          setOtpEmail(response.email);
          setLastOtpExpiry(Date.now() + response.otpExpiresIn * 1000);
          setSecondsLeft(response.otpExpiresIn);
          setMode("otp");
        },
      },
    );
  };

  const handleContinueWithGoogle = () => {
    const returnUrl = `${window.location.origin}/auth/google/callback`;
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"}/auth/google/start?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    setDigits((previous) => {
      const next = [...previous];
      next[index] = nextDigit;
      return next;
    });
    if (nextDigit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!readyVerify) return;
    setVerifying(true);
    try {
      await verifyOtpMutation.mutateAsync({ email: otpEmail, otp: otpValue });
    } finally {
      setVerifying(false);
    }
  };

  const inputCls = [
    "h-12 w-full rounded-2xl border px-4 text-sm font-semibold transition-all duration-200 outline-none",
    "border-sky-200/70 bg-white/90 text-slate-900 placeholder:text-slate-400 shadow-sm",
    "focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-400/15 focus:shadow-[0_12px_30px_rgba(37,99,235,0.10)]",
  ].join(" ");
  const labelCls = "mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500";
  const errorCls = "mt-1 text-[10px] font-semibold leading-tight text-rose-500";
  const primaryBtn = [
    "h-12 w-full rounded-2xl text-sm font-black text-white transition-all duration-200",
    "bg-gradient-to-r from-blue-600 to-sky-500",
    "hover:from-blue-500 hover:to-sky-400 hover:scale-[1.01] hover:shadow-[0_18px_36px_rgba(37,99,235,0.28)]",
    "active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100",
  ].join(" ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{ background: "rgba(15,23,42,0.40)", backdropFilter: "blur(14px)", animation: "authBackdropIn 260ms ease-out both" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex w-full overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out"
        style={{
          maxWidth: mode === "register" ? "1040px" : "940px",
          minHeight: mode === "register" ? "660px" : mode === "otp" ? "580px" : "600px",
          borderRadius: "2rem",
          border: "0",
          boxShadow: "0 34px 100px rgba(15,23,42,0.30)",
          background: "rgba(255,255,255,0.82)",
          animation: "authCardIn 560ms cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <BrandPanel copy={copy} />

        <section
          className="relative flex flex-1 flex-col justify-center"
          style={{
            padding: mode === "register" ? "2rem 3rem" : mode === "otp" ? "2.4rem 3rem" : "2.35rem 3rem",
            background: "linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,247,255,0.94))",
            backdropFilter: "blur(28px) saturate(1.9)",
            borderLeft: "1px solid rgba(255,255,255,0.75)",
          }}
        >
          <div className="absolute right-5 top-5 z-30 flex items-center gap-2">
            <div className="flex rounded-full border border-sky-100 bg-white/80 p-1 shadow-sm">
              {(["vi", "en"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-black uppercase transition",
                    language === item ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900",
                  )}
                  aria-label={`${copy.language}: ${item.toUpperCase()}`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 hover:rotate-90"
              style={{ background: "rgba(15,23,42,0.06)", border: "1px solid rgba(15,23,42,0.10)", color: "#64748b" }}
              aria-label={copy.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {mode === "login" ? (
            <div key={`${language}-login`} className="mx-auto w-full max-w-[520px] space-y-7 pt-8 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
              <AuthHeader eyebrow={copy.eyebrowLogin} icon={ShieldCheck} title={copy.loginTitle} description={copy.loginDescription} />
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Field label={copy.identifierLabel} error={loginIdError}>
                  <input
                    value={loginId}
                    onChange={(event) => setLoginId(event.target.value.replace(/\s/g, ""))}
                    placeholder={copy.identifierPlaceholder}
                    className={inputCls}
                  />
                  <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </Field>

                <Field
                  label={copy.passwordLabel}
                  error={loginPassError}
                  action={
                    <Link href="/forgot-password" onClick={onClose} className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-700">
                      {copy.forgotPassword}
                    </Link>
                  }
                >
                  <input
                    type={loginPassVisibility.inputType}
                    value={loginPass}
                    onChange={(event) => setLoginPass(event.target.value)}
                    placeholder={copy.passwordPlaceholder}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setIsLoginPassVisible((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {isLoginPassVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </Field>

                <button type="submit" disabled={!canLoginSubmit} className={primaryBtn}>
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      {copy.loggingIn}
                    </>
                  ) : (
                    copy.loginButton
                  )}
                </button>

                {loginErrorMessage ? <ErrorBox message={loginErrorMessage} /> : null}
              </form>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {copy.orContinueWith}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
                </div>

                <button
                  type="button"
                  onClick={handleContinueWithGoogle}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.99]"
                >
                  <GoogleIcon />
                  {copy.googleLoginButton}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 border-t border-slate-200/70 pt-4">
                <span className="text-sm text-slate-500">{copy.noAccount}</span>
                <button type="button" onClick={() => setMode("register")} className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline">
                  {copy.registerLink}
                </button>
              </div>
            </div>
          ) : null}

          {mode === "register" ? (
            <div key={`${language}-register`} className="mx-auto flex w-full max-w-[560px] flex-col gap-4 pt-8 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
              <AuthHeader eyebrow={copy.eyebrowRegister} icon={Star} title={copy.registerTitle} description={copy.registerDescription} />
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <Field label={copy.nameLabel} error={regNameError}>
                  <input value={regName} onChange={(event) => setRegName(event.target.value)} placeholder={copy.namePlaceholder} className={inputCls} />
                  <UserRound className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </Field>

                <Field label={copy.phoneLabel} error={regPhoneError}>
                  <input value={regPhone} onChange={(event) => setRegPhone(event.target.value.replace(/\s/g, ""))} placeholder={copy.phonePlaceholder} className={inputCls} />
                  <Phone className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </Field>

                <Field label={copy.emailLabel} error={regEmailError}>
                  <input value={regEmail} onChange={(event) => setRegEmail(event.target.value)} placeholder={copy.emailPlaceholder} className={inputCls} />
                  <Mail className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={copy.passwordLabel} error={regPassError}>
                    <input type={regPassVisibility.inputType} value={regPass} onChange={(event) => setRegPass(event.target.value)} placeholder={copy.passwordPlaceholder} className={inputCls} />
                    <button
                      type="button"
                      onClick={() => setIsRegPassVisible((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={regPassVisibility.actionLabel}
                    >
                      {isRegPassVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </Field>
                  <Field label={copy.confirmPasswordLabel} error={regConfirmError}>
                    <input type={regConfirmVisibility.inputType} value={regConfirmPass} onChange={(event) => setRegConfirmPass(event.target.value)} placeholder={copy.passwordPlaceholder} className={inputCls} />
                    <button
                      type="button"
                      onClick={() => setIsRegConfirmVisible((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label={regConfirmVisibility.actionLabel}
                    >
                      {isRegConfirmVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </Field>
                </div>

                <button type="submit" disabled={!canRegisterSubmit} className={primaryBtn}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      {copy.registering}
                    </>
                  ) : (
                    copy.registerButton
                  )}
                </button>

                  {registerErrorMessage ? <ErrorBox message={registerErrorMessage} /> : null}
                </form>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {copy.orContinueWith}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
                  </div>

                  <button
                    type="button"
                    onClick={handleContinueWithGoogle}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.99]"
                  >
                    <GoogleIcon />
                    {copy.googleRegisterButton}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 border-t border-slate-200/70 pt-3">
                  <span className="text-sm text-slate-500">{copy.hasAccount}</span>
                  <button type="button" onClick={() => setMode("login")} className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 hover:underline">
                  {copy.backToLogin}
                </button>
              </div>
            </div>
          ) : null}

          {mode === "otp" ? (
            <div className="mx-auto w-full max-w-[500px] space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400 ease-out">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-200 bg-sky-50 shadow-[0_14px_32px_rgba(14,165,233,0.14)]">
                  <ShieldCheck className="h-8 w-8 text-sky-500" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-3xl font-black tracking-tight text-slate-950">{copy.otpTitle}</h3>
                <p className="text-sm font-medium leading-6 text-slate-500">
                  {copy.otpDescription} <span className="font-bold text-slate-800">{otpEmail}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-center gap-2">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element;
                      }}
                      value={digit}
                      onChange={(event) => handleDigitChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      inputMode="numeric"
                      maxLength={1}
                      className={cn(
                        "h-14 w-12 rounded-2xl border text-center text-lg font-black shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-400/20",
                        digit
                          ? "border-blue-400 bg-blue-50 text-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.10)]"
                          : "border-sky-200/70 bg-white/90 text-slate-700",
                      )}
                    />
                  ))}
                </div>
                {otpVerifyError ? <p className="text-center text-xs font-semibold text-rose-500">{otpVerifyError}</p> : null}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm">
                <span className="font-medium text-slate-600">
                  {secondsLeft > 0 ? (
                    <>
                      {copy.otpExpires} <span className="font-bold text-slate-800">{secondsLeft}s</span>
                    </>
                  ) : (
                    <span className="text-slate-400">{copy.otpCanResend}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => void handleSendOtp()}
                  disabled={sendOtpMutation.isPending || !emailPattern.test(otpEmail)}
                  className="font-bold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-40"
                >
                  {sendOtpMutation.isPending ? copy.otpSending : copy.otpSendAgain}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01]"
                  style={{ borderColor: "rgba(186,230,255,0.8)", background: "rgba(240,249,255,0.8)", color: "#475569" }}
                  onClick={() => setMode("register")}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {copy.otpBackBtn}
                </Button>
                <button type="button" disabled={!readyVerify || verifying} onClick={handleVerify} className={primaryBtn}>
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      {copy.otpVerifying}
                    </>
                  ) : (
                    copy.otpVerifyBtn
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function BrandPanel({ copy }: { copy: Record<string, string> }) {
  return (
    <aside className="relative hidden shrink-0 flex-col justify-center overflow-hidden bg-slate-950 md:flex" style={{ width: "43%" }}>
      <video
        src="/cinematic-carwash.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-[1.62] object-cover opacity-70 blur-xl"
        style={{ objectPosition: "center center" }}
      />
      <video
        src="/cinematic-carwash.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute -top-[24%] left-0 h-[148%] w-full scale-[1.02] object-cover"
        style={{ objectPosition: "center center" }}
      />
      <div className="absolute inset-x-0 top-0 h-[8%] bg-gradient-to-b from-slate-950/18 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[8%] bg-gradient-to-t from-slate-950/18 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,12,28,0.54)_0%,rgba(4,12,28,0.24)_54%,rgba(4,12,28,0.06)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,28,0.00)_0%,rgba(4,12,28,0.00)_50%,rgba(4,12,28,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.14),transparent_36%),radial-gradient(circle_at_85%_18%,rgba(37,99,235,0.08),transparent_30%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[390px] flex-col justify-center gap-6 px-8 py-10">
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-[0_16px_40px_rgba(37,99,235,0.42)]">
            <span className="absolute inset-0 rounded-2xl bg-white/20 blur-md" />
            <span className="absolute -inset-1 rounded-[1.35rem] border border-sky-200/25 opacity-70" />
            <Sparkles className="relative h-5 w-5 text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]" />
          </div>
          <div>
            <span className="block text-[12px] font-black uppercase tracking-[0.24em] text-white/95">
              AURA DETAILING
            </span>
            <span className="mt-0.5 block text-[10.5px] font-semibold text-sky-100/85">
              {copy.brandSubtitle}
            </span>
          </div>
        </div>

        <h2 className="relative max-w-[360px] text-[1.72rem] font-black leading-[1.12] tracking-[-0.025em] text-white animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          <span className="absolute -left-3 top-1 h-[calc(100%-0.15rem)] w-1 rounded-full bg-gradient-to-b from-sky-300 via-white to-blue-500 shadow-[0_0_26px_rgba(56,189,248,0.58)]" />
          <span className="relative block pl-3 drop-shadow-[0_8px_22px_rgba(8,16,40,0.95)]">
            {copy.brandTitleA}
          </span>
          <span className="relative inline-block pl-3 bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_8px_26px_rgba(14,165,233,0.28)]">
            {copy.brandTitleB}
          </span>
          <span className="relative block pl-3 bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_8px_26px_rgba(14,165,233,0.28)] mt-1">
            {copy.brandTitleC}
          </span>
        </h2>

        <p className="w-full max-w-[350px] rounded-full border border-sky-100/20 bg-white/[0.06] px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-sky-50/90 shadow-[0_10px_30px_rgba(8,16,40,0.18)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150">
          {copy.brandDesc}
        </p>

        <div className="grid w-full max-w-[350px] grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
          {[
            { label: copy.featureA, icon: CalendarCheck },
            { label: copy.featureB, icon: Gauge },
            { label: copy.featureC, icon: Star },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="group flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border border-sky-100/16 bg-slate-950/24 px-2.5 py-3 text-center text-[10px] font-bold leading-4 text-white/90 shadow-[0_10px_28px_rgba(8,16,40,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/45 hover:bg-sky-400/14 hover:text-white hover:shadow-[0_18px_42px_rgba(14,165,233,0.26)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-sky-100/25 bg-sky-300/14 text-sky-100 shadow-[0_0_18px_rgba(56,189,248,0.18)] transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-300/24 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AuthHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
}: {
  eyebrow: string;
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h3 className="text-4xl font-black tracking-tight text-slate-950">{title}</h3>
      <p className="text-sm font-medium leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Field({
  label,
  error,
  action,
  children,
}: {
  label: string;
  error?: string | null;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">{children}</div>
      {error ? <p className="mt-1 text-[10px] font-semibold leading-tight text-rose-500">{error}</p> : null}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-3 py-2.5 text-center text-xs font-semibold text-rose-600">
      {message}
    </div>
  );
}

function GoogleIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.35 11.1H12v3.9h5.35c-.23 1.4-1 2.6-2.2 3.4v2.8h3.55c2.08-1.9 3.28-4.7 3.28-8.1 0-.7-.06-1.3-.18-2z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.97 0 5.47-.98 7.29-2.66l-3.55-2.8c-.99.66-2.26 1.05-3.74 1.05-2.87 0-5.3-1.93-6.17-4.53H2.17v2.9A10 10 0 0 0 12 22z"
        />
        <path
          fill="#FBBC05"
          d="M5.83 13.06A5.98 5.98 0 0 1 5.5 11c0-.72.12-1.42.33-2.06V6.04H2.17A10 10 0 0 0 2 11c0 1.61.39 3.12 1.08 4.46l2.75-2.4z"
        />
        <path
          fill="#EA4335"
          d="M12 5.92c1.62 0 3.06.56 4.2 1.65l3.15-3.15A9.97 9.97 0 0 0 12 2 10 10 0 0 0 2.17 6.04l3.66 2.9C6.7 7.84 9.03 5.92 12 5.92z"
        />
      </svg>
    </span>
  );
}


