import { AdminBookingDetail } from "@/features/admin/bookings/components/admin-booking-detail";

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  return <AdminBookingDetail bookingId={params.id} />;
}
