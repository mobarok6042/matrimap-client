"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Compass, Shield, User, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout-button";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import type { UserRole } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
    if (!session?.user) return;
    if (session.user.image) {
      setAvatarUrl(session.user.image);
    }
    apiFetch<Profile>("/api/profiles/me")
      .then((p) => {
        setProfile(p);
        if (p?.images?.[0]) {
          setAvatarUrl(p.images[0]);
        }
      })
      .catch(() => {});
  }, [session]);

  if (isPending) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading session…</main>;
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Sign in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth?mode=sign-in" className={cn(buttonVariants())}>
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const role = (session.user as { role?: UserRole }).role;
  const displayName = profile?.displayName || session.user.name || session.user.email?.split("@")[0] || "User";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome back to your MatriMap control center.</p>
      </motion.div>

      <div className="grid gap-6">
        {/* User Summary Card with medium size profile picture */}
        <Card className="overflow-hidden border border-foreground/10 bg-white/60 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              {/* Medium size profile picture (size-24 / 96px) */}
              <div className="relative shrink-0">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
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
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h2>
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

        {/* Quick Links Card */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border border-foreground/10 bg-white/40 dark:border-white/10 dark:bg-zinc-900/40">
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

          <Card className="border border-foreground/10 bg-white/40 dark:border-white/10 dark:bg-zinc-900/40">
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

        {/* Premium Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle>Premium Membership</CardTitle>
            <CardDescription>Upgrade to unlock verified contacts and direct messaging.</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
