import { CustomerBookingDetailPage } from "@/features/bookings/components/booking-detail-page";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return <CustomerBookingDetailPage bookingId={params.id} />;
}
