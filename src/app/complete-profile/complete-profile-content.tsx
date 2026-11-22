"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";
import { showAuthSuccessAlert, showErrorAlert } from "@/lib/alerts";
import type { UserRole } from "@/lib/auth-client";
import { getAuthErrorMessage, getUserFacingError } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [saving, setSaving] = React.useState(false);

  const role = (session?.user as { role?: UserRole } | undefined)?.role;

  React.useEffect(() => {
    if (isPending || !session) return;
    if (role === "customer" || role === "vendor" || role === "admin") {
      router.replace("/dashboard");
    }
  }, [isPending, session, role, router]);

  async function chooseRole(nextRole: "customer" | "vendor") {
    setSaving(true);
    try {
      const result = await authClient.updateUser({
        role: nextRole,
      } as unknown as Parameters<typeof authClient.updateUser>[0]);

      if (result.error) {
        await showErrorAlert(
          getAuthErrorMessage(result.error.message, "We could not save your account type. Please try again."),
          "Account type could not be saved",
        );
        return;
      }

      await refetch();
      await showAuthSuccessAlert("Signin", nextRole);
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      await showErrorAlert(
        getUserFacingError(caught, "We could not save your account type. Please try again."),
        "Account type could not be saved",
      );
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Checking your account…
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Sign in before choosing your account role.</CardDescription>
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

  if (role === "customer" || role === "vendor" || role === "admin") {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Taking you to your dashboard…
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>One last step</CardTitle>
          <CardDescription>
            Thanks for signing in with Google, {session.user.name ?? "there"}. Choose how you want
            to use MatriMap.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button type="button" size="lg" disabled={saving} onClick={() => chooseRole("customer")}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Continue as Customer
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={saving}
            onClick={() => chooseRole("vendor")}
          >
            Continue as Vendor
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
