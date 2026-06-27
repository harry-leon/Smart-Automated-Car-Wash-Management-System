import { apiRequest } from "@/shared/lib/api";
import type {
  CustomerPreferences,
  UpdateCustomerPreferencesRequest,
  UpdateCustomerPreferencesResponse,
} from "@/entities/preferences";

export function getCustomerPreferences() {
  return apiRequest<CustomerPreferences>({
    method: "GET",
    url: "/users/preferences",
  });
}

export function updateCustomerPreferences(payload: UpdateCustomerPreferencesRequest) {
  return apiRequest<UpdateCustomerPreferencesResponse, UpdateCustomerPreferencesRequest>({
    method: "PUT",
    url: "/users/preferences",
    data: payload,
  });
}
