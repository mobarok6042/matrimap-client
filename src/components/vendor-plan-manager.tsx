"use client";

import * as React from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch, getUserFacingError } from "@/lib/api";
import { confirmAction, showErrorAlert, showSuccessAlert } from "@/lib/alerts";

type PlanName = "free" | "basic" | "max";
type PaidPlanName = Exclude<PlanName, "free">;
type PlanDetails = { name: string; serviceLimit: number; amount: number; currency: string };
type PlanSummary = {
  plan: PlanName;
  serviceCount: number;
  serviceLimit: number;
  plans: Record<PlanName, PlanDetails>;
};

export function VendorPlanManager() {
  const [summary, setSummary] = React.useState<PlanSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<"basic" | "max" | "cancel" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    apiFetch<PlanSummary>("/api/payments/me")
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((caught: unknown) => {
        if (active) setError(getUserFacingError(caught, "We could not load your plan. Please try again."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function choosePlan(plan: PaidPlanName) {
    setBusy(plan);
    setError(null);
    try {
      const session = await apiFetch<{ url: string | null }>("/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      if (!session.url) throw new Error("Stripe did not return a checkout URL.");
      window.location.assign(session.url);
    } catch (caught) {
      await showErrorAlert(
        getUserFacingError(caught, "We could not start checkout. Please try again."),
        "Checkout could not be started",
      );
      setBusy(null);
    }
  }

  async function cancelPlan() {
    const confirmed = await confirmAction({
      title: "Cancel your paid plan?",
      text: "You will move to Free, and MatriMap will delete your stored plan transaction records. This does not refund the one-time Stripe payment.",
      confirmText: "Cancel paid plan",
    });
    if (!confirmed) return;

    setBusy("cancel");
    setError(null);
    try {
      await apiFetch<{ plan: "free" }>("/api/payments/cancel", { method: "POST" });
      setSummary((current) =>
        current
          ? {
              ...current,
              plan: "free",
              serviceLimit: current.plans.free.serviceLimit,
            }
          : current,
      );
      void showSuccessAlert("Plan cancelled", "Your account has moved to the Free plan.");
    } catch (caught) {
      await showErrorAlert(
        getUserFacingError(caught, "We could not cancel your plan. Please try again."),
        "Plan could not be cancelled",
      );
    } finally {
      setBusy(null);
    }
  }

  function formatPrice(details: PlanDetails) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: details.currency.toUpperCase(),
    }).format(details.amount / 100);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor plans</CardTitle>
        <CardDescription>
          Free includes 3 service listings. Paid plans are one-time purchases.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your plan…
          </p>
        ) : summary ? (
          <>
            <p className="text-sm">
              Current plan: <strong className="capitalize">{summary.plan}</strong>
              {" · "}{summary.serviceCount} of {summary.serviceLimit} services used
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {(["free", "basic", "max"] as const).map((planName) => {
                const plan = summary.plans[planName];
                const isCurrent = summary.plan === planName;
                return (
                  <article key={planName} className="rounded-xl border border-border p-4">
                    <h2 className="font-semibold">{plan.name}</h2>
                    <p className="mt-1 text-lg font-semibold">
                      {plan.amount === 0 ? "Free" : formatPrice(plan)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Up to {plan.serviceLimit} services
                    </p>
                    {planName !== "free" && (
                      <p className="text-xs text-muted-foreground">One-time payment</p>
                    )}
                    {planName !== "free" && !isCurrent && (
                      <Button
                        type="button"
                        className="mt-4 w-full"
                        disabled={busy !== null}
                        onClick={() => void choosePlan(planName)}
                      >
                        {busy === planName ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CreditCard className="size-4" />
                        )}
                        Choose {plan.name}
                      </Button>
                    )}
                    {isCurrent && (
                      <p className="mt-4 text-sm font-medium text-primary">Current plan</p>
                    )}
                  </article>
                );
              })}
            </div>
            {summary.plan !== "free" && (
              <div className="flex flex-col items-start gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => void cancelPlan()}
                >
                  {busy === "cancel" && <Loader2 className="size-4 animate-spin" />}
                  Cancel paid plan
                </Button>
                <p className="text-xs text-muted-foreground">
                  Cancellation removes paid access and stored transaction records; it does not refund
                  your one-time payment.
                </p>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
