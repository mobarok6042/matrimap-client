"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Menu, PlusCircle, User, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse services" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => setMenuOpen(false);

  React.useEffect(() => {
    setImageError(false);
    if (!session?.user) {
      setAvatarUrl(null);
      return;
    }

    if (session.user.image) {
      setAvatarUrl(session.user.image);
      return;
    }

    let active = true;
    apiFetch<Profile>("/api/profiles/me")
      .then((profile) => {
        if (!active) return;
        if (profile?.images?.[0]) {
          setAvatarUrl(profile.images[0]);
        }
      })
      .catch(() => {
        // No profile yet or error, fallback to default icon
      });

    return () => {
      active = false;
    };
  }, [session]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const isVendor = (session?.user as { role?: string } | undefined)?.role === "vendor";

  const activeNavLinks = [
    ...navLinks,
    ...(isVendor ? [{ href: "/services/add", label: "Add Service" }] : []),
  ];

  return (
    <header className="sticky top-4 z-50 mx-auto mt-4 w-[calc(100%-2rem)] max-w-6xl">
      <div className="relative flex h-16 items-center justify-between rounded-2xl border border-border/70 bg-transparent px-3 sm:px-5">
        {/* Logo — left */}
        <Link href="/" onClick={closeMenu} aria-label="MatriMap home" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt=""
            width={50}
            height={40}
            priority
            className="h-10 w-auto object-contain sm:h-11"
          />
        </Link>

        {/* Links — middle (centred regardless of side widths) */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {activeNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-foreground/5 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side navbar — desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setIsHovered((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isHovered}
                className="flex items-center gap-2.5 rounded-full border border-border bg-transparent py-1 pl-3.5 pr-2 text-sm transition-colors hover:bg-accent"
              >
                <span className="text-sm font-medium text-foreground">
                  Welcome, <span className="font-semibold">{displayName}</span>
                </span>
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setImageError(true)}
                    className="size-8 rounded-full object-cover ring-1 ring-foreground/20"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                    <User className="size-4" />
                  </div>
                )}
                <ChevronDown
                  className={cn(
                    "size-3.5 text-muted-foreground transition-transform duration-200",
                    isHovered && "rotate-180",
                  )}
                />
              </button>

              {/* Hover card */}
              <div
                className={cn(
                  "absolute right-0 top-full z-50 min-w-56 pt-2 transition-all duration-200",
                  isHovered
                    ? "visible translate-y-0 opacity-100 pointer-events-auto"
                    : "invisible -translate-y-1 opacity-0 pointer-events-none",
                )}
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-xl">
                  <div className="flex items-center gap-3 border-b border-foreground/10 px-3 py-2.5">
                    {avatarUrl && !imageError ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        onError={() => setImageError(true)}
                        className="size-9 rounded-full object-cover ring-1 ring-foreground/20"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                        <User className="size-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>

                  <div className="mt-1 flex flex-col gap-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsHovered(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                    >
                      <LayoutDashboard className="size-4 text-muted-foreground" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsHovered(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                    >
                      <User className="size-4" />
                      Profile
                    </Link>
                    {isVendor && (
                      <Link
                        href="/services/add"
                        onClick={() => setIsHovered(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <PlusCircle className="size-4" />
                        Add Service
                      </Link>
                    )}
                    <div className="my-1 border-t border-foreground/10" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsHovered(false);
                        void signOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/auth?mode=sign-in"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign in
              </Link>
              <Link href="/auth?mode=sign-up" className={cn(buttonVariants({ size: "sm" }))}>
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Menu toggle — right (mobile / tablet) */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-transparent text-foreground transition-colors hover:bg-accent lg:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {/* Dropdown panel (mobile / tablet) */}
        {menuOpen && (
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-2xl border border-border bg-popover p-3 shadow-2xl lg:hidden">
            <nav className="flex flex-col">
              {activeNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-foreground/5 text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-2 flex flex-col gap-2 border-t border-foreground/10 pt-3">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    {avatarUrl && !imageError ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        onError={() => setImageError(true)}
                        className="size-9 rounded-full object-cover ring-1 ring-foreground/20"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                        <User className="size-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        Welcome, <span className="font-semibold">{displayName}</span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-start gap-2")}
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="outline sm w-full justify-start gap-2 border-foreground/30 text-primary hover:bg-primary/10"
                  >
                    <User className="size-4" />
                    Profile
                  </Link>
                  {isVendor && (
                    <Link
                      href="/services/add"
                      onClick={() => setIsHovered(false)}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full justify-start gap-2 border-primary/30 text-primary hover:bg-primary/10",
                      )}
                    >
                      <PlusCircle className="size-4" />
                      Add Service
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      closeMenu();
                      void signOut();
                    }}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth?mode=sign-in"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth?mode=sign-up"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ size: "sm" }), "w-full")}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

