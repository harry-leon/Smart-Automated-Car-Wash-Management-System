import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingTrendPoint } from "../types/report.types";

interface Props {
  data: BookingTrendPoint[];
}

export function BookingTrendChart({ data }: Props) {
  return (
    <Card className="border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-accent/20 py-4">
        <CardTitle className="text-base font-semibold">Booking trend (this week)</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="label" className="text-xs" stroke="currentColor" opacity={0.6} />
              <YAxis className="text-xs" stroke="currentColor" opacity={0.6} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="bookings"
                name="Bookings"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                fill="hsl(var(--primary) / 0.5)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
