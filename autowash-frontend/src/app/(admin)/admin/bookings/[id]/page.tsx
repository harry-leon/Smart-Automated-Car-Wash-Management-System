import { AdminBookingDetail } from "@/components/admin-bookings/admin-booking-detail";

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  return <AdminBookingDetail bookingId={params.id} />;
}
