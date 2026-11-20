"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  CreditCard,
  Crown,
  LayoutDashboard,
  Layers3,
  Menu,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Booking, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardRole = "customer" | "vendor" | "admin";

interface DashboardNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  role: DashboardRole;
  name: string;
  email: string;
  children: React.ReactNode;
}

interface Metric {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

const navigationByRole: Record<DashboardRole, DashboardNavigationItem[]> = {
  customer: [
    { href: "#overview", label: "Overview", icon: LayoutDashboard },
    { href: "#bookings", label: "My bookings", icon: CalendarDays },
    { href: "/services", label: "Browse services", icon: Search },
    { href: "/profiles", label: "Matrimony profiles", icon: Users },
    { href: "/profile", label: "My profile", icon: CircleUserRound },
  ],
  vendor: [
    { href: "#overview", label: "Overview", icon: LayoutDashboard },
    { href: "#services", label: "My services", icon: Layers3 },
    { href: "/services/add", label: "Add a service", icon: Search },
    { href: "#bookings", label: "Booking requests", icon: CalendarDays },
    { href: "#plans", label: "Plan & billing", icon: Crown },
    { href: "/profile", label: "My profile", icon: CircleUserRound },
  ],
  admin: [
    { href: "#overview", label: "Overview", icon: LayoutDashboard },
    { href: "#vendor-plan-payments", label: "Plan payments", icon: CreditCard },
    { href: "#manage-services", label: "Manage services", icon: Layers3 },
    { href: "#managed-accounts", label: "Accounts", icon: Users },
  ],
};

function DashboardSidebar({
  role,
  name,
  email,
  activeItem,
  onNavigate,
}: {
  role: DashboardRole;
  name: string;
  email: string;
  activeItem: string;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Shield className="size-4" />
          MatriMap workspace
        </p>
        <p className="mt-4 truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
        <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
          {role}
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Dashboard navigation">
        {navigationByRole[role].map((item) => {
          const Icon = item.icon;
          const active = item.href.startsWith("#")
            ? pathname === "/dashboard" && activeItem === item.href
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href.startsWith("#") ? `/dashboard${item.href}` : item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Return to marketplace
        </Link>
      </div>
    </div>
  );
}

function DashboardMetrics({ role }: { role: Exclude<DashboardRole, "admin"> }) {
  const [metrics, setMetrics] = React.useState<Metric[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function loadMetrics() {
      try {
        if (role === "vendor") {
          const [services, bookings, plan] = await Promise.all([
            apiFetch<Service[]>("/api/services/vendor/me"),
            apiFetch<Booking[]>("/api/bookings/vendor/me"),
            apiFetch<{ plan: string }>("/api/payments/me"),
          ]);
          if (!active) return;
          const activeServices = services.filter(
            (service) => service.approvalStatus === "approved" && service.isAvailable !== false,
          ).length;
          const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
          setMetrics([
            {
              label: "Active services",
              value: String(activeServices),
              detail: `${services.length} total listings`,
              icon: Layers3,
            },
            {
              label: "Pending requests",
              value: String(pendingBookings),
              detail: "Need your attention",
              icon: Clock3,
            },
            {
              label: "Current plan",
              value: plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1),
              detail: "Manage your listing limit",
              icon: Crown,
            },
          ]);
        } else {
          const [bookings, services] = await Promise.all([
            apiFetch<Booking[]>("/api/bookings/me"),
            apiFetch<Service[]>("/api/services"),
          ]);
          if (!active) return;
          const acceptedBookings = bookings.filter((booking) => booking.status === "accepted").length;
          setMetrics([
            {
              label: "Booking requests",
              value: String(bookings.length),
              detail: "All your service enquiries",
              icon: CalendarDays,
            },
            {
              label: "Accepted",
              value: String(acceptedBookings),
              detail: "Confirmed by vendors",
              icon: CheckCircle2,
            },
            {
              label: "Available services",
              value: String(services.length),
              detail: "Explore the marketplace",
              icon: Search,
            },
          ]);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load dashboard statistics.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMetrics();
    return () => {
      active = false;
    };
  }, [role]);

  return (
    <section aria-label="Dashboard statistics" className="mb-6">
      {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                {loading ? "—" : metric.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </article>
          );
        })}
        {loading && metrics.length === 0 && (
          <div className="col-span-full rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Loading your dashboard statistics…
          </div>
        )}
      </div>
    </section>
  );
}

export function DashboardShell({ role, name, email, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState("#overview");
  const closeMobileMenu = () => setMobileMenuOpen(false);

  React.useEffect(() => {
    const updateActiveItem = () => setActiveItem(window.location.hash || "#overview");
    window.addEventListener("hashchange", updateActiveItem);
    return () => window.removeEventListener("hashchange", updateActiveItem);
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:block">
          <DashboardSidebar
            role={role}
            name={name}
            email={email}
            activeItem={activeItem}
            onNavigate={closeMobileMenu}
          />
        </aside>

        <div className="min-w-0">
          <div
            id={role === "admin" ? undefined : "overview"}
            className="mb-6 flex items-center justify-between gap-4"
          >
            <div>
              {role !== "admin" && (
                <>
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {role} dashboard
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Welcome back, {name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Here’s what’s happening with your MatriMap account.
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open dashboard navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="dashboard-mobile-sidebar"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>

          {role !== "admin" && <DashboardMetrics role={role} />}
          {children}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close dashboard navigation"
            className="absolute inset-0 bg-black/55"
          />
          <aside
            id="dashboard-mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col border-r border-border bg-card text-card-foreground shadow-2xl"
          >
            <div className="flex items-center justify-end border-b border-border p-3">
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close dashboard navigation"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-foreground hover:bg-accent"
              >
                <X className="size-5" />
              </button>
            </div>
            <DashboardSidebar
              role={role}
              name={name}
              email={email}
              activeItem={activeItem}
              onNavigate={closeMobileMenu}
            />
          </aside>
        </div>
      )}
    </main>
  );
}
