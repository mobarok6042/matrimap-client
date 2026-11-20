"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function RoleLanding({
  role,
  showWelcome,
}: {
  role: "customer" | "vendor";
  showWelcome: boolean;
}) {
  const { data: session, isPending } = useSession();
  const isVendor = role === "vendor";

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
          {isPending
            ? "Loading your account…"
            : session
              ? `Signed in as ${session.user.email} (${role}).`
              : "You are browsing this area while signed out."}
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
            <CardTitle>Browse services</CardTitle>
            <CardDescription>See everything MatriMap has to offer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/services" className={cn(buttonVariants())}>
              Explore services
            </Link>
          </CardContent>
        </Card>
      </div>

      {!session && !isPending && (
        <div className="mt-8">
          <Button asChild variant="link" className="px-0">
            <Link href="/auth?mode=sign-in">Sign in to continue</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
