import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";

export function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
