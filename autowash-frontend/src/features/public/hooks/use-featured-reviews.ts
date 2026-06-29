"use client";

import { useQuery } from "@tanstack/react-query";
import type { FeaturedReview } from "@/entities/reviews";
import type { ApiErrorResponse } from "@/shared/types/api.types";
import { listFeaturedReviews } from "@/features/public/lib/public-content-service";

export function useFeaturedReviews(limit = 6) {
  return useQuery<FeaturedReview[], ApiErrorResponse>({
    queryKey: ["public-featured-reviews", limit],
    queryFn: () => listFeaturedReviews(limit),
    staleTime: 60_000,
  });
}
