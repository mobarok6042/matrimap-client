"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { VendorServices } from "@/components/vendor-services";

export function RoleLanding({
  role,
  showWelcome,
}: {
  role: "customer" | "vendor";
  showWelcome: boolean;
}) {
  const { data: session, isPending } = useSession();
  const isVendor = role === "vendor";
  const currentRole = (session?.user as { role?: string } | undefined)?.role;

  if (isPending) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-muted-foreground">
        Checking your account…
      </main>
    );
  }

  if (!session || currentRole !== role) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>{session ? "Access restricted" : "Sign in required"}</CardTitle>
            <CardDescription>
              {session
                ? `This page is available only to ${role} accounts.`
                : `Sign in with a ${role} account to continue.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Link href={session ? "/dashboard" : "/auth?mode=sign-in"} className={cn(buttonVariants())}>
              {session ? "Go to dashboard" : "Sign in"}
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mb-6 rounded-xl border border-secondary/50 bg-secondary/15 px-4 py-3 text-sm text-foreground"
        >
          {isVendor
            ? "Your vendor account is ready. Welcome to MatriMap!"
            : "Your account is ready. Welcome to MatriMap!"}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {isVendor ? "Vendor space" : "Customer space"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {isVendor ? "Grow your business with MatriMap" : "Find the right service for your big day"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Signed in as {session.user.email} ({role}).
        </p>
      </motion.div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isVendor ? "Manage your listings" : "Browse services"}</CardTitle>
            <CardDescription>
              {isVendor
                ? "Set up your profile and start receiving enquiries."
                : "Explore vendors, compare packages and save favourites."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
              Open dashboard
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isVendor ? "Add a service" : "Browse services"}</CardTitle>
            <CardDescription>
              {isVendor
                ? "Create another listing for customers to discover."
                : "See everything MatriMap has to offer."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={isVendor ? "/services/add" : "/services"} className={cn(buttonVariants())}>
              {isVendor ? "Add service" : "Explore services"}
            </Link>
          </CardContent>
        </Card>
      </div>

      {isVendor && <div className="mt-8"><VendorServices /></div>}
    </main>
  );
}
