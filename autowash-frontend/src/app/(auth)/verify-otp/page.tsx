import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams?: {
    phone?: string;
    autoSend?: string;
  };
}) {
  return (
    <VerifyOtpForm
      autoSend={searchParams?.autoSend === "1"}
      initialPhone={searchParams?.phone ?? ""}
    />
  );
}
