"use client";

import * as React from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, getUserFacingError } from "@/lib/api";

interface CheckoutSession {
  id: string;
  url: string | null;
}

export function CheckoutButton() {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCheckout() {
    setBusy(true);
    setError(null);

    try {
      const session = await apiFetch<CheckoutSession>("/api/payments/checkout", {
        method: "POST",
      });
      if (!session.url) throw new Error("Stripe did not return a checkout URL.");
      window.location.assign(session.url);
    } catch (caught) {
      setError(getUserFacingError(caught, "We could not start checkout. Please try again."));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleCheckout} disabled={busy} className="self-start">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        Upgrade to Premium
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
