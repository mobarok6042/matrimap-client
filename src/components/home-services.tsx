"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Loader2, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { apiFetch, getUserFacingError } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HomeServices() {
  const { data: session, isPending: sessionPending } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (sessionPending || role === "vendor") return;
    let active = true;

    apiFetch<Service[]>("/api/services")
      .then((data) => {
        if (active) {
          const prioritized = [...data].sort(
            (a, b) => Number(b.isAvailable !== false) - Number(a.isAvailable !== false),
          );
          setServices(prioritized.slice(0, 6));
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(getUserFacingError(caught, "We could not load featured services. Please try again later."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [role, sessionPending]);

  if (role === "vendor") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20" aria-labelledby="vendor-services">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Vendor space</p>
        <h2 id="vendor-services" className="mt-2 text-3xl font-semibold tracking-tight">
          Manage your services
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your listings are available only in your vendor workspace.
        </p>
        <Link href="/vendor" className={cn(buttonVariants(), "mt-6 gap-2")}>
          My Services <ArrowRight className="size-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20" aria-labelledby="featured-services">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Find your perfect vendors
          </p>
          <h2 id="featured-services" className="mt-2 text-3xl font-semibold tracking-tight">
            Wedding Services
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore trusted services to make your celebration memorable.
          </p>
        </div>
        <Link
          href="/services"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2 self-start sm:self-auto")}
        >
          Browse all services <ArrowRight className="size-4" />
        </Link>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading services…
        </div>
      ) : services.length === 0 ? (
        <p className="rounded-lg border border-border bg-card/60 p-8 text-center text-muted-foreground">
          No services are available yet. Check back soon or browse the full catalog.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service._id}
              className="group overflow-hidden border-border bg-card/80 transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <Link href={`/services/${service._id}`} className="flex h-full flex-col">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-primary/5 text-primary">
                      <Building2 className="size-12 opacity-40" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 max-w-[75%] truncate rounded-full bg-primary/85 px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                    {service.category}
                  </span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 text-xs font-semibold text-foreground">
                    <Star className="size-3 fill-secondary text-secondary" />
                    {service.rating ?? 5}
                  </span>
                  {service.isAvailable === false && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="line-clamp-2 text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{service.location}</span>
                  </p>
                  <div className="mt-auto border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Starting from</span>
                    <p className="font-bold text-primary">
                      ৳ {service.price.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / {service.pricingUnit || "event"}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
