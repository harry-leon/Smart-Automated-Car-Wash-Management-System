import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof Error && /401/.test(error.message)) {
            return false;
          }

          return failureCount < 1;
        },
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: false
      }
    }
  });
}
