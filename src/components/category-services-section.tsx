"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Loader2, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Service } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CategoryServicesSection({
  onSelectCategory,
}: {
  onSelectCategory: (category: string) => void;
}) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    apiFetch<Service[]>("/api/services")
      .then((data) => {
        if (active) setServices(data);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load service categories.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = React.useMemo(() => {
    const grouped = new Map<string, Service[]>();
    for (const service of services) {
      const current = grouped.get(service.category) ?? [];
      current.push(service);
      grouped.set(service.category, current);
    }
    return [...grouped.entries()].sort(([first], [second]) => first.localeCompare(second));
  }, [services]);

  return (
    <section className="mt-20" aria-labelledby="services-by-category">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Explore by interest</p>
        <h2 id="services-by-category" className="mt-2 text-3xl font-semibold tracking-tight">
          Services by category
        </h2>
        <p className="mt-2 text-muted-foreground">
          Find the right team by exploring the services currently listed on MatriMap.
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : loading ? (
        <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading categories…
        </div>
      ) : categories.length === 0 ? (
        <p className="rounded-lg border border-border bg-card/60 p-6 text-sm text-muted-foreground">
          Categories will appear here as approved services are added.
        </p>
      ) : (
        <div className="space-y-12">
          {categories.map(([category, listings]) => (
            <section key={category} aria-label={category}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{category}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {listings.length} {listings.length === 1 ? "listing" : "listings"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
                >
                  Browse category <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {listings.slice(0, 3).map((service) => (
                  <Card key={service._id} className="overflow-hidden border-border bg-card/80">
                    <Link href={`/services/${service._id}`} className="group">
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {service.image ? (
                          <img
                            src={service.image}
                            alt={service.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-primary/5 text-primary">
                            <Building2 className="size-10 opacity-40" />
                          </div>
                        )}
                      </div>
                      <CardContent className="space-y-2 p-4">
                        <h4 className="line-clamp-1 font-semibold group-hover:text-primary">
                          {service.title}
                        </h4>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 text-primary" />
                          <span className="truncate">{service.location}</span>
                        </p>
                        <p className="font-semibold text-primary">
                          ৳ {service.price.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            / {service.pricingUnit || "event"}
                          </span>
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
