import { CustomerBookingDetailPage } from "@/components/customer-bookings/booking-detail-page";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return <CustomerBookingDetailPage bookingId={params.id} />;
}
