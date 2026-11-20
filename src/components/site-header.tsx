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
  const [profileAvatar, setProfileAvatar] = React.useState<{ userId: string; url: string } | null>(null);
  const [failedAvatarUrl, setFailedAvatarUrl] = React.useState<string | null>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const closeMenu = () => setMenuOpen(false);

  React.useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  React.useEffect(() => {
    if (!session?.user || session.user.image) return;

    let active = true;
    apiFetch<Profile>("/api/profiles/me")
      .then((profile) => {
        if (!active) return;
        if (profile?.images?.[0]) {
          setProfileAvatar({ userId: session.user.id, url: profile.images[0] });
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
  const avatarUrl =
    session?.user?.image ||
    (profileAvatar && profileAvatar.userId === session?.user?.id ? profileAvatar.url : null);
  const isVendor = (session?.user as { role?: string } | undefined)?.role === "vendor";
  const isHome = pathname === "/";

  const activeNavLinks = isVendor
    ? [
        { href: "/", label: "Home" },
        { href: "/vendor", label: "My Services" },
        { href: "/services/add", label: "Add Service" },
      ]
    : navLinks;

  return (
    <>
      <header
        className={cn(
          "z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl",
          isHome
            ? "fixed left-1/2 top-4 -translate-x-1/2"
            : "sticky top-4 mt-4",
        )}
      >
      <div
        className={cn(
          "relative flex h-16 items-center justify-between rounded-2xl px-3 shadow-lg shadow-foreground/10 backdrop-blur-2xl backdrop-saturate-150 sm:px-5",
          isHome
            ? "border border-white/25 bg-primary/10"
            : "border border-border/70 bg-background/75",
        )}
      >
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
                {avatarUrl && failedAvatarUrl !== avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setFailedAvatarUrl(avatarUrl)}
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
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-popover/85 p-1.5 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 border-b border-foreground/10 px-3 py-2.5">
                    {avatarUrl && failedAvatarUrl !== avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        onError={() => setFailedAvatarUrl(avatarUrl)}
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
          aria-controls="mobile-navigation-drawer"
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-transparent text-foreground transition-colors hover:bg-accent lg:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

      </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/55"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            id="mobile-navigation-drawer"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-border bg-popover text-popover-foreground shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Link href="/" onClick={closeMenu} aria-label="MatriMap home" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt=""
                  width={50}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation menu"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {session && (
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted p-3">
                  {avatarUrl && failedAvatarUrl !== avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      onError={() => setFailedAvatarUrl(avatarUrl)}
                      className="size-10 rounded-full object-cover ring-1 ring-foreground/20"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                      <User className="size-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {activeNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {session && (
                <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <User className="size-4" />
                    Profile
                  </Link>
                  {isVendor && (
                    <Link
                      href="/services/add"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <PlusCircle className="size-4" />
                      Add Service
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border p-4">
              {session ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    closeMenu();
                    void signOut();
                  }}
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              ) : (
                <>
                  <Link
                    href="/auth?mode=sign-in"
                    onClick={closeMenu}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth?mode=sign-up"
                    onClick={closeMenu}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

