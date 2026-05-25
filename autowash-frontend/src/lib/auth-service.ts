import { toAuthApiError } from "@/lib/api-errors";
import { apiRequest } from "@/lib/api";
import { ApiErrorResponse } from "@/types/api.types";
import {
  LoginRequest,
  LoginResponseData,
  LogoutRequest,
  RegisterRequest,
  RegisterResponseData,
  SendOtpRequest,
  SendOtpResponseData,
  VerifyOtpRequest,
  VerifyOtpResponseData,
} from "@/types/auth.types";

export async function registerCustomer(payload: RegisterRequest) {
  try {
    return await apiRequest<RegisterResponseData, RegisterRequest>({
      method: "POST",
      url: "/auth/register",
      data: payload
    });
  } catch (error) {
    throw toAuthApiError(error as ApiErrorResponse);
  }
}

export async function loginCustomer(payload: LoginRequest) {
  try {
    return await apiRequest<LoginResponseData, LoginRequest>({
      method: "POST",
      url: "/auth/login",
      data: payload
    });
  } catch (error) {
    throw toAuthApiError(error as ApiErrorResponse);
  }
}

export async function sendCustomerOtp(payload: SendOtpRequest) {
  try {
    return await apiRequest<SendOtpResponseData, SendOtpRequest>({
      method: "POST",
      url: "/auth/otp/send",
      data: payload
    });
  } catch (error) {
    throw toAuthApiError(error as ApiErrorResponse);
  }
}

export async function verifyCustomerOtp(payload: VerifyOtpRequest) {
  try {
    return await apiRequest<VerifyOtpResponseData, VerifyOtpRequest>({
      method: "POST",
      url: "/auth/otp/verify",
      data: payload
    });
  } catch (error) {
    throw toAuthApiError(error as ApiErrorResponse);
  }
}

export async function logoutCustomer(payload: LogoutRequest) {
  try {
    await apiRequest<null, LogoutRequest>({
      method: "POST",
      url: "/auth/logout",
      data: payload
    });
  } catch (error) {
    throw toAuthApiError(error as ApiErrorResponse);
  }
}
