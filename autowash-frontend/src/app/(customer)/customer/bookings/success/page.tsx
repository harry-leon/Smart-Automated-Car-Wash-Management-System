import { CustomerBookingSuccessPage } from "@/components/customer-bookings/booking-success-page";

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams?: { bookingId?: string };
}) {
  const params = searchParams ?? {};
  return <CustomerBookingSuccessPage bookingId={params.bookingId ?? ""} />;
}
