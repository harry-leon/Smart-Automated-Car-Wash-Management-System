import { CarFront, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/modules/public-auth/components/LanguageSwitcher";
import { BookingStatusBadge } from "../components/BookingStatusBadge";
import { CompleteWashPanel } from "../components/CompleteWashPanel";
import {
  formatOperationDateTimeByLocale,
  useOperationActions,
  useOperationBookings,
} from "../mock/operations.mock";
import styles from "../styles/checkin.module.css";

export function WashProgressPage({ bookingId }: { bookingId: string }) {
  const bookings = useOperationBookings();
  const { completeWashBooking } = useOperationActions();
  const { lang, t } = useLanguage();
  const booking = bookings.find((item) => item.id === bookingId) ?? null;
  const locale = lang === "vi" ? "vi-VN" : "en-US";

  if (!booking) return null;

  const handleCompleteWash = () => {
    try {
      const updated = completeWashBooking(booking.id);
      toast.success(
        t(
          `${updated.bookingCode} completed. +${updated.pointsEarned} points recorded.`,
          `${updated.bookingCode} đã hoàn tất. Đã ghi nhận +${updated.pointsEarned} điểm.`,
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("Unable to complete wash.", "Không thể hoàn tất rửa xe."),
      );
    }
  };

  return (
    <Card className="rounded-lg border-border/50 bg-card/70 shadow-lg">
      <CardHeader className="p-5">
        <CardTitle className="flex flex-wrap items-center gap-3 text-base">
          <CarFront className="text-primary" />
          {t("Wash progress", "Tiến độ rửa xe")}
          <BookingStatusBadge status={booking.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className={styles.timeline}>
            <TimelineItem
              title={t("Checked in", "Đã check-in")}
              value={formatOperationDateTimeByLocale(booking.checkinTime, locale)}
            />
            <TimelineItem
              title={t("Estimated finish", "Dự kiến hoàn tất")}
              value={formatOperationDateTimeByLocale(booking.estimatedFinishTime, locale)}
            />
            <TimelineItem
              title={
                booking.status === "COMPLETED"
                  ? t("Wash completed", "Đã rửa xong")
                  : t("Vehicle in wash", "Xe đang được rửa")
              }
              value={
                booking.status === "COMPLETED"
                  ? formatOperationDateTimeByLocale(booking.completedTime, locale)
                  : t(
                      `${booking.vehiclePlate} is being washed by ${booking.assignedStaff}`,
                      `${booking.vehiclePlate} đang được rửa bởi ${booking.assignedStaff}`,
                    )
              }
            />
            {booking.pointTransaction && (
              <TimelineItem
                title={t("Point transaction", "Giao dịch điểm")}
                value={`${booking.pointTransaction.id} - +${booking.pointTransaction.pointsEarned} ${t("pts", "điểm")}`}
              />
            )}
          </div>
          <CompleteWashPanel booking={booking} onCompleteWash={handleCompleteWash} />
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ title, value }: { title: string; value: string }) {
  return (
    <div className={styles.timelineItem}>
      <span className={styles.timelineDot} />
      <div>
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <CheckCircle2 className="text-primary" />
          {title}
        </div>
        <div className="mt-1 text-sm font-medium text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}
