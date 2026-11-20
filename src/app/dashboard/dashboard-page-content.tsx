"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Loader2,
  MapPin,
  Shield,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout-button";
import { VendorPlanManager } from "@/components/vendor-plan-manager";
import { AdminDashboard } from "@/components/admin-dashboard";
import { VendorServices } from "@/components/vendor-services";
import { DashboardShell } from "@/components/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import type { UserRole } from "@/lib/auth-client";
import { ApiError, apiFetch } from "@/lib/api";
import type { Booking, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Booking["status"] }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 border border-secondary/50 px-2 py-0.5 text-xs font-semibold text-foreground">
        <CheckCircle2 className="size-3" /> Accepted
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-xs font-semibold text-destructive">
        <XCircle className="size-3" /> Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent border border-secondary/50 px-2 py-0.5 text-xs font-semibold text-foreground">
      <Calendar className="size-3" /> Pending
    </span>
  );
}

// ─── Customer booking history ─────────────────────────────────────────────────
function CustomerBookings() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch<Booking[]>("/api/bookings/me")
      .then(setBookings)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load booking requests.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border border-border bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="size-4 text-primary" /> My Booking Requests
        </CardTitle>
        <CardDescription>Track the status of services you have requested.</CardDescription>
      </CardHeader>
      <CardContent>
          {error ? (
            <p role="alert" className="py-4 text-sm text-destructive">{error}</p>
          ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="size-4 animate-spin" /> Loading bookings…
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            You have no booking requests yet.{" "}
            <Link href="/services" className="underline text-primary">
              Browse services
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <div
                key={String(b._id)}
                className="rounded-xl border border-border bg-card/70 p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-foreground leading-tight">
                    {b.serviceTitle}
                  </p>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {b.vendorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> {b.eventDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {b.eventLocation}
                  </span>
                </div>
                {b.message && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-2 italic">
                    &quot;{b.message}&quot;
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground/60">
                  Submitted {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Vendor booking requests ──────────────────────────────────────────────────
function VendorBookings() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBookings = React.useCallback(() => {
    apiFetch<Booking[]>("/api/bookings/vendor/me")
      .then(setBookings)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load booking requests.");
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAction = async (id: string, action: "accept" | "decline") => {
    setActionLoading(id + action);
    setError(null);
    try {
      const updated = await apiFetch<Booking>(`/api/bookings/${id}/${action}`, {
        method: "POST",
      });
      setBookings((prev) =>
        prev.map((b) => (String(b._id) === String(updated._id) ? updated : b))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update booking request.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card className="border border-border bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="size-4 text-primary" /> Incoming Booking Requests
        </CardTitle>
        <CardDescription>Accept or decline booking requests from customers.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="size-4 animate-spin" /> Loading requests…
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No booking requests yet. Make sure your services are listed and visible.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <div
                key={String(b._id)}
                className="rounded-xl border border-border bg-card/70 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm text-foreground leading-tight">
                      {b.serviceTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      From: {b.customerName} ({b.customerEmail})
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> {b.eventDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {b.eventLocation}
                  </span>
                </div>
                {b.message && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-3 italic">
                    &quot;{b.message}&quot;
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground/60">
                  Received {new Date(b.createdAt).toLocaleDateString()}
                </p>

                {/* Accept / Decline buttons – only for pending */}
                {b.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => handleAction(String(b._id), "accept")}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/85 disabled:opacity-60"
                      )}
                    >
                      {actionLoading === String(b._id) + "accept" ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => handleAction(String(b._id), "decline")}
                      className={cn(
                        buttonVariants({ variant: "destructive", size: "sm" }),
                        "gap-1.5 disabled:opacity-60"
                      )}
                    >
                      {actionLoading === String(b._id) + "decline" ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: UserRole } | undefined)?.role;
  const isBlocked = (session?.user as { isBlocked?: boolean } | undefined)?.isBlocked === true;
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/auth?mode=sign-in");
    } else if (!isBlocked && role !== "customer" && role !== "vendor" && role !== "admin") {
      router.replace("/complete-profile");
    }
  }, [isBlocked, isPending, role, router, session]);

  React.useEffect(() => {
    if (!session?.user || isBlocked) return;
    apiFetch<Profile>("/api/profiles/me")
      .then((p) => {
        setProfile(p);
        if (p?.images?.[0]) {
          setAvatarUrl(p.images[0]);
        }
      })
      .catch((caught: unknown) => {
        if (caught instanceof ApiError && caught.status === 404) return;
        setProfileError(
          caught instanceof Error ? caught.message : "Could not load your profile details.",
        );
      });
  }, [isBlocked, session]);

  if (isPending) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading session…</main>;
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">
        Redirecting to sign in…
      </main>
    );
  }

  if (isBlocked) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Account blocked</CardTitle>
            <CardDescription>
              Your account is blocked and cannot access dashboard features. Contact support for assistance.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (role !== "customer" && role !== "vendor" && role !== "admin") {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Completing account setup…</main>;
  }

  const isVendor = role === "vendor";
  const displayName =
    profile?.displayName || session.user.name || session.user.email?.split("@")[0] || "User";

  if (role === "admin") {
    return (
      <DashboardShell role="admin" name={displayName} email={session.user.email}>
        <AdminDashboard adminName={displayName} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role={role}
      name={displayName}
      email={session.user.email}
    >
      <div className="space-y-6">
        {/* User Summary Card */}
        <Card id="profile-summary" className="scroll-mt-24 overflow-hidden border border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="relative shrink-0">
                {(avatarUrl || session.user.image) && !imageError ? (
                  <img
                    src={avatarUrl || session.user.image || ""}
                    alt={displayName}
                    onError={() => setImageError(true)}
                    className="size-24 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
                  />
                ) : (
                  <div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/20 shadow-md">
                    <User className="size-12" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                    <Shield className="size-3 text-primary" />
                    {role ?? "Customer"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
                {profile?.location && (
                  <p className="text-xs text-muted-foreground">📍 {profile.location}</p>
                )}
                {profile?.bio && (
                  <p className="line-clamp-2 text-sm text-muted-foreground/90">{profile.bio}</p>
                )}
                {profileError && (
                  <p role="alert" className="text-sm text-destructive">{profileError}</p>
                )}
              </div>

              <div className="shrink-0">
                <Link
                  href="/profile"
                  className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                >
                  <User className="size-4" />
                  Manage Profile
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking section — role-specific */}
        <section id="bookings" className="scroll-mt-24">
          {isVendor ? <VendorBookings /> : <CustomerBookings />}
        </section>

        {isVendor && (
          <section id="services" className="scroll-mt-24">
            <VendorServices />
          </section>
        )}

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-2">
          {!isVendor && (
            <Card className="border border-border bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Compass className="size-4 text-primary" /> Browse Services
                </CardTitle>
                <CardDescription>Explore matrimonial and wedding vendor services.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/services" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  View services
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="border border-border bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-primary" /> Community Profiles
              </CardTitle>
              <CardDescription>Discover candidate profiles from our community.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profiles" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                View profiles
              </Link>
            </CardContent>
          </Card>
        </div>

        {isVendor ? (
          <section id="plans" className="scroll-mt-24">
            <VendorPlanManager />
          </section>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Premium Membership</CardTitle>
              <CardDescription>Upgrade to unlock verified contacts and direct messaging.</CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutButton />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
