import { AdminBookingDetail } from "@/features/bookings/components/admin-booking-detail";

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  return <AdminBookingDetail bookingId={params.id} />;
}
