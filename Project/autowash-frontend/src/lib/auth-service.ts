import { toAuthApiError } from "@/lib/api-errors";
import { apiRequest } from "@/lib/api";
import { ApiErrorResponse } from "@/types/api.types";
import { LoginRequest, LoginResponseData } from "@/types/auth.types";

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
