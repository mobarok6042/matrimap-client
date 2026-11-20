"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout-button";
import { ImageUpload } from "@/components/image-upload";
import { ProfileForm } from "@/components/profile-form";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

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
            <Link href="/auth" className={cn(buttonVariants())}>
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-muted-foreground">Signed in as {session.user.email}</p>
      </motion.div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>Saved to MongoDB through the Express API.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>Uploads go to the API, then to ImgBB.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardDescription>Test mode Stripe Checkout session.</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
