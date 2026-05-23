"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthApiError } from "@/lib/api-errors";
import { loginCustomer } from "@/lib/auth-service";
import { clearAuthSession, setAuthSession } from "@/store/auth.store";
import { LoginRequest, LoginResponseData } from "@/types/auth.types";

export function useCustomerLogin() {
  const router = useRouter();

  return useMutation<LoginResponseData, AuthApiError, LoginRequest>({
    mutationFn: loginCustomer,
    onSuccess: (data) => {
      if (data.role !== "CUSTOMER") {
        throw new AuthApiError({
          message: "Role is not allowed for customer portal.",
          statusCode: 403,
          errorCode: "INSUFFICIENT_PERMISSION"
        });
      }

      setAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
        expiresIn: data.expiresIn,
        user: {
          userId: data.userId,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email ?? null,
          role: data.role,
          status: data.status,
          tier: data.tier ?? null,
          loyaltyBalance: data.loyaltyBalance ?? null
        }
      });

      router.push("/customer/home");
    },
    onError: (error) => {
      if (error.isInvalidSession()) {
        clearAuthSession();
      }
    }
  });
}
