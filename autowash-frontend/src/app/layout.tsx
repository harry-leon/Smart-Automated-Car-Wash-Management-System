import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoWash Pro",
  description: "AutoWash Pro internal portal"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
