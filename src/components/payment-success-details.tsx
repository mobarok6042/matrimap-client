"use client";

import * as React from "react";
import Link from "next/link";
import { CircleCheck, CircleX, Clock3, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, getUserFacingError } from "@/lib/api";
import { cn } from "@/lib/utils";

type PaymentStatus = "pending" | "paid" | "failed" | "expired";

interface PaymentConfirmation {
  vendorId: string | null;
  plan: "basic" | "max" | null;
  amount: number | null;
  currency: string | null;
  stripeSessionId: string;
  stripeSubscriptionId: string | null;
  status: PaymentStatus;
  createdAt: string;
  mode: "test" | "live";
}

export function PaymentSuccessDetails({ sessionId }: { sessionId: string | null }) {
  const [payment, setPayment] = React.useState<PaymentConfirmation | null>(null);
  const [error, setError] = React.useState<string | null>(
    sessionId ? null : "The Stripe checkout session ID is missing.",
  );
  const [loading, setLoading] = React.useState(Boolean(sessionId));
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!sessionId) return;
    let active = true;

    apiFetch<PaymentConfirmation>(
      `/api/payments/session/${encodeURIComponent(sessionId)}`,
    )
      .then((confirmation) => {
        if (active) setPayment(confirmation);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(getUserFacingError(caught, "We could not verify this payment. Please try again."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId, refreshKey]);

  const isPaid = payment?.status === "paid";
  const isFailed = payment?.status === "failed" || payment?.status === "expired";
  const title = error
    ? "Unable to verify payment"
    : isPaid
      ? "Payment successful"
      : isFailed
        ? "Payment not completed"
        : "Payment processing";
  const description = error
    ? "We could not verify this Stripe session. Sign in with the account used for checkout and try again."
    : isPaid
      ? "Your vendor plan payment has been verified."
      : isFailed
        ? "This checkout did not complete. You can return to your dashboard and try again."
        : "We’re confirming your payment with Stripe. This page will show the verified details as soon as they are available.";

  function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          {loading ? (
            <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          ) : isPaid ? (
            <CircleCheck className="mx-auto size-10 text-primary" />
          ) : isFailed || error ? (
            <CircleX className="mx-auto size-10 text-destructive" />
          ) : (
            <Clock3 className="mx-auto size-10 text-primary" />
          )}
          <CardTitle>{loading ? "Verifying payment" : title}</CardTitle>
          <CardDescription>{loading ? "Retrieving your secure Stripe checkout details…" : description}</CardDescription>
          {payment?.mode === "test" && (
            <span className="mx-auto mt-2 inline-flex rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold text-secondary-foreground">
              Stripe test mode
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}

          {payment && (
            <dl className="grid gap-3 rounded-xl border border-border bg-muted/50 p-4 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">Vendor ID</dt>
                <dd className="mt-1 break-all font-mono text-sm">{payment.vendorId || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Plan</dt>
                <dd className="mt-1 text-sm capitalize">{payment.plan || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Amount</dt>
                <dd className="mt-1 text-sm">
                  {payment.amount !== null && payment.currency
                    ? formatAmount(payment.amount, payment.currency)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Currency</dt>
                <dd className="mt-1 text-sm uppercase">{payment.currency || "—"}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">Stripe session ID</dt>
                <dd className="mt-1 break-all font-mono text-xs">{payment.stripeSessionId}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">Stripe subscription ID</dt>
                <dd className="mt-1 break-all font-mono text-xs">
                  {payment.stripeSubscriptionId || "Not applicable for a one-time purchase"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1 text-sm capitalize">{payment.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Created at</dt>
                <dd className="mt-1 text-sm">{new Date(payment.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {!loading && payment?.status === "pending" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setRefreshKey((key) => key + 1);
                }}
              >
                Refresh status
              </Button>
            )}
            <Link href="/dashboard" className={cn(buttonVariants())}>
              Back to dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
