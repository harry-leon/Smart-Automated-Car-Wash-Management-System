import { apiRequest } from "@/shared/lib/api";
import type {
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UserProfile,
} from "@/entities/users";

export function getCustomerProfile() {
  return apiRequest<UserProfile>({
    method: "GET",
    url: "/users/profile",
  });
}

export function updateCustomerProfile(payload: UpdateUserProfileRequest) {
  return apiRequest<UpdateUserProfileResponse, UpdateUserProfileRequest>({
    method: "PUT",
    url: "/users/profile",
    data: payload,
  });
}
