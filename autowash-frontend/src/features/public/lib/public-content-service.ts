import { apiRequest } from "@/shared/lib/api";
import type { FeaturedReview } from "@/entities/reviews";

export function listFeaturedReviews(limit = 6) {
  return apiRequest<FeaturedReview[]>({
    method: "GET",
    url: "/reviews/featured",
    params: { limit },
  });
}
