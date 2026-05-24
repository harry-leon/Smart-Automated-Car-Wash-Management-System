// Minimal stub for useCustomerBooking used by AppShell.
// This file provides a lightweight implementation to satisfy imports
// and keep the Next.js App Router skeleton buildable.

export function useCustomerBooking() {
  const setLanguage = (lang: string) => {
    // no-op placeholder; real implementation lives in the original module
    // and can be ported later.
    console.log("setCustomerBookingLanguage:", lang);
  };

  return {
    setLanguage,
  } as const;
}
