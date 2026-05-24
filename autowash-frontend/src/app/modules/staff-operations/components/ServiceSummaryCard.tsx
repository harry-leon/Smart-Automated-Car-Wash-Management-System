import { CalendarClock, CarFront, StickyNote, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/app/modules/public-auth/components/LanguageSwitcher";
import { formatOperationDateTimeByLocale } from "../mock/operations.mock";
import type { OperationBooking } from "../types/operations.types";
import styles from "../styles/checkin.module.css";
import { translateServiceLabel } from "../utils/service-labels";

export function ServiceSummaryCard({ booking }: { booking: OperationBooking }) {
  const { lang, t } = useLanguage();
  const locale = lang === "vi" ? "vi-VN" : "en-US";

  return (
    <Card className="rounded-lg border-border/50 bg-card/70 shadow-lg">
      <CardHeader className="p-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="text-primary" />
          {t("Booking detail", "Chi tiết booking")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className={styles.detailGrid}>
          <InfoTile label={t("Customer", "Khách hàng")} value={booking.customerName} />
          <InfoTile label={t("Phone", "Điện thoại")} value={booking.customerPhone} />
          <InfoTile label={t("Vehicle plate", "Biển số xe")} value={booking.vehiclePlate} plate />
          <InfoTile label={t("Vehicle", "Xe")} value={booking.vehicleModel} />
          <InfoTile
            label={t("Service package", "Gói dịch vụ")}
            value={translateServiceLabel(booking.servicePackage, lang)}
          />
          <InfoTile
            label={t("Package duration", "Thời lượng gói")}
            value={`${booking.packageDurationMinutes} ${t("minutes", "phút")}`}
          />
          <InfoTile
            label={t("Scheduled time", "Giờ hẹn")}
            value={formatOperationDateTimeByLocale(booking.scheduledAt, locale)}
          />
          <InfoTile
            label={t("Assigned staff", "Nhân viên phụ trách")}
            value={booking.assignedStaff}
          />
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-border/50 bg-background/55 p-4">
          <StickyNote className="text-primary" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("Customer note", "Ghi chú khách hàng")}
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {booking.customerNote ?? t("No customer note.", "Không có ghi chú từ khách hàng.")}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border/50 bg-background/55 p-4">
          <CarFront className="text-primary" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("Plate verification", "Xác minh biển số")}
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {t(
                `Match ${booking.vehiclePlate} before staff check-in.`,
                `Đối chiếu biển số ${booking.vehiclePlate} trước khi nhân viên check-in.`,
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border/50 bg-background/55 p-4">
          <CalendarClock className="text-primary" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("Booking window", "Khung giờ booking")}
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {formatOperationDateTimeByLocale(booking.scheduledAt, locale)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({ label, value, plate }: { label: string; value: string; plate?: boolean }) {
  return (
    <div className={styles.infoTile}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={plate ? styles.plateValue : styles.infoValue}>{value}</div>
    </div>
  );
}
