"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <ThemeToggle />
    </ThemeProvider>
  );
}
