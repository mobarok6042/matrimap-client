"use client";

import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle light and dark themes"
      title="Toggle light and dark themes"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="fixed bottom-5 right-5 z-40 size-12 rounded-full border-border bg-card text-foreground shadow-lg hover:bg-accent"
    >
      <SunMoon className="size-5" />
    </Button>
  );
}
