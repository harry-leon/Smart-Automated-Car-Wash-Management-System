"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { createQueryClient } from "@/shared/lib/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState<QueryClient>(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
