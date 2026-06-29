export type FeaturedReview = {
  reviewId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  featured: boolean;
  createdAt: string;
};
