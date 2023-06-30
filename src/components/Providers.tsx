"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface LayoutProps {
  children: ReactNode;
}

const Providers: FC<LayoutProps> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
};

export default Providers;
