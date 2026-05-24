import { CheckCircle2, CircleSlash, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/app/modules/public-auth/components/LanguageSwitcher";
import { formatOperationTimeByLocale } from "../mock/operations.mock";
import type { OperationBooking } from "../types/operations.types";
import type { StaffBookingStatus } from "../types/status.types";
import { translateServiceLabel } from "../utils/service-labels";
import { BookingStatusBadge } from "./BookingStatusBadge";
import styles from "../styles/operations-board.module.css";

interface OperationsTableProps {
  bookings: OperationBooking[];
  onOpenBooking: (id: string) => void;
}

export function OperationsTable({ bookings, onOpenBooking }: OperationsTableProps) {
  const { lang, t } = useLanguage();
  const locale = lang === "vi" ? "vi-VN" : "en-US";

  return (
    <div className={styles.tableShell}>
      <Table>
        <TableHeader>
          <TableRow className={styles.tableHeaderRow}>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Booking code", "Mã booking")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Customer name", "Khách hàng")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Vehicle plate", "Biển số xe")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Service package", "Gói dịch vụ")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Assigned staff", "Nhân viên phụ trách")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Scheduled time", "Giờ hẹn")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Check-in time", "Giờ check-in")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Estimated finish", "Dự kiến hoàn tất")}
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Status", "Trạng thái")}
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-foreground/80">
              {t("Action", "Thao tác")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className={styles.emptyState}>
                {t(
                  "No bookings match the selected filters.",
                  "Không có booking nào khớp bộ lọc đã chọn.",
                )}
              </TableCell>
            </TableRow>
          )}
          {bookings.map((booking) => {
            const action = actionForStatus(booking.status);
            const Icon = action.icon;
            return (
              <TableRow key={booking.id} className={styles.tableRow}>
                <TableCell className="px-4 py-4">
                  <span className={styles.bookingCode}>{booking.bookingCode}</span>
                </TableCell>
                <TableCell className="px-4 py-4 font-semibold">
                  <div>{booking.customerName}</div>
                  <div className={styles.mutedCell}>{booking.customerPhone}</div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="font-mono font-bold text-primary">{booking.vehiclePlate}</div>
                  <div className={styles.mutedCell}>{booking.vehicleModel}</div>
                </TableCell>
                <TableCell className="max-w-[230px] px-4 py-4">
                  <div className="font-semibold leading-snug">
                    {translateServiceLabel(booking.servicePackage, lang)}
                  </div>
                  <div className={styles.mutedCell}>
                    {booking.packageDurationMinutes} {t("minutes", "phút")}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 font-semibold">{booking.assignedStaff}</TableCell>
                <TableCell className="px-4 py-4 font-semibold">
                  {formatOperationTimeByLocale(booking.scheduledAt, locale)}
                </TableCell>
                <TableCell className="px-4 py-4 font-semibold">
                  {formatOperationTimeByLocale(booking.checkinTime, locale)}
                </TableCell>
                <TableCell className="px-4 py-4 font-semibold">
                  {formatOperationTimeByLocale(booking.estimatedFinishTime, locale)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <Button
                    size="sm"
                    variant={action.variant}
                    onClick={() => onOpenBooking(booking.id)}
                    className={cn("rounded-lg font-bold", action.emphasis)}
                  >
                    <Icon data-icon="inline-start" />
                    {t(action.label, action.labelVi)}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function actionForStatus(status: StaffBookingStatus): {
  label: string;
  labelVi: string;
  icon: typeof Eye;
  variant: "default" | "outline" | "secondary";
  emphasis?: string;
} {
  if (status === "CONFIRMED") {
    return { label: "Check-in", labelVi: "Check-in", icon: CheckCircle2, variant: "default" };
  }

  if (status === "CHECKED_IN") {
    return { label: "Start wash", labelVi: "Bắt đầu rửa", icon: Play, variant: "secondary" };
  }

  if (status === "IN_PROGRESS") {
    return { label: "View wash", labelVi: "Xem ca rửa", icon: Eye, variant: "outline" };
  }

  if (status === "COMPLETED") {
    return { label: "View", labelVi: "Xem", icon: Eye, variant: "outline" };
  }

  return { label: "Closed", labelVi: "Đã đóng", icon: CircleSlash, variant: "outline" };
}
