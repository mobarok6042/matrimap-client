"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Service } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function VendorServices() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    apiFetch<Service[]>("/api/services/vendor/me")
      .then((data) => {
        if (active) setServices(data);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load your services.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function deleteService(service: Service) {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    setActionId(service._id);
    setError(null);
    try {
      await apiFetch<void>(`/api/services/${service._id}`, { method: "DELETE" });
      setServices((current) => current.filter((item) => item._id !== service._id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the service.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>My Services</CardTitle>
        <Link href="/services/add" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
          <PlusCircle className="size-4" /> Add service
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your services…
          </p>
        ) : services.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">You have not added any services yet.</p>
        ) : (
          services.map((service) => (
            <article
              key={service._id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{service.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {service.category} · ৳ {service.price.toLocaleString()}
                </p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {service.approvalStatus ?? "pending"}
                  {service.isAvailable === false ? " · inactive" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/services/${service._id}/edit`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                >
                  <Pencil className="size-3.5" /> Edit
                </Link>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={actionId !== null}
                  onClick={() => void deleteService(service)}
                  className="gap-1.5"
                >
                  {actionId === service._id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Delete
                </Button>
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
