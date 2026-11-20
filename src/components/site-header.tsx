"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Heart, LogOut, Moon, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { data: session, isPending } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart className="size-4 fill-current" />
          </span>
          MatriMap
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/profiles" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Profiles
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <Moon className="size-4 dark:hidden" />
            <Sun className="hidden size-4 dark:block" />
          </Button>

          {isPending ? null : session ? (
            <>
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
                Dashboard
              </Link>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => void signOut()}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Link href="/auth" className={cn(buttonVariants({ size: "sm" }))}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
