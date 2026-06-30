import { apiClient, apiRequest } from "@/shared/lib/api";

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
}

export function submitBookingReview(payload: CreateReviewRequest) {
  return apiRequest<ReviewResponse, CreateReviewRequest>({
    method: "POST",
    url: "/reviews",
    data: payload,
  });
}

export async function getFeaturedReviews(): Promise<ReviewResponse[]> {
  const response = await apiClient.get<{ data: ReviewResponse[] }>("/reviews/featured");
  return response.data.data;
}
