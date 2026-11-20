"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient, redirectPathForRole, useSession } from "@/lib/auth-client";
import type { UserRole } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const role = (session?.user as { role?: UserRole } | undefined)?.role;

  React.useEffect(() => {
    if (isPending || !session) return;
    if (role === "customer" || role === "vendor") {
      router.replace(redirectPathForRole(role));
    }
  }, [isPending, session, role, router]);

  async function chooseRole(nextRole: "customer" | "vendor") {
    setSaving(true);
    setError(null);
    try {
      const result = await authClient.updateUser({
        role: nextRole,
      } as unknown as Parameters<typeof authClient.updateUser>[0]);

      if (result.error) {
        setError(result.error.message ?? "Could not save your role.");
        return;
      }

      await refetch();
      router.replace(`/${nextRole}?welcome=1`);
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message ?? "Could not save your role.");
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

  if (role === "customer" || role === "vendor") {
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
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
