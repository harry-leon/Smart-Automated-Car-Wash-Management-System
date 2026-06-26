import { CustomerBookingSuccessPage } from "@/features/customer/bookings/components/booking-success-page";

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams?: { bookingId?: string };
}) {
  const params = searchParams ?? {};
  return <CustomerBookingSuccessPage bookingId={params.bookingId ?? ""} />;
}
