import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "AutoWash Pro",
  description: "Customer authentication data layer foundation"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
