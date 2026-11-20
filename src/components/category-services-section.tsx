"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Loader2, MapPin, Search, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Service } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Photography & Videography",
  "Venues & Banquet Halls",
  "Catering & Feasts",
  "Bridal Wear & Styling",
  "Makeup & Hair Styling",
  "Decoration & Floral",
  "Music, DJ & Entertainment",
  "Wedding Planning & Coordination",
  "Invitation & Gifts",
  "Jewelry & Accessories",
  "Other",
];

type PriceOrder = "recommended" | "ascending" | "descending";

export function CategoryServicesSection() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [keyword, setKeyword] = React.useState("");
  const [priceOrder, setPriceOrder] = React.useState<PriceOrder>("recommended");
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (keyword.trim()) params.set("search", keyword.trim());
      const query = params.toString();
      const path = query ? `/api/services?${query}` : "/api/services";

      setLoading(true);
      setError(null);
      apiFetch<Service[]>(path)
        .then((data) => {
          if (active) setServices(data);
        })
        .catch((caught: unknown) => {
          if (active) {
            setError(caught instanceof Error ? caught.message : "Could not load service categories.");
            setServices([]);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [keyword, selectedCategory]);

  const sortedServices = React.useMemo(() => {
    if (priceOrder === "recommended") return services;
    return [...services].sort((first, second) =>
      priceOrder === "ascending"
        ? first.price - second.price
        : second.price - first.price,
    );
  }, [priceOrder, services]);

  const categories = React.useMemo(() => {
    const grouped = new Map<string, Service[]>();
    for (const service of sortedServices) {
      const current = grouped.get(service.category) ?? [];
      current.push(service);
      grouped.set(service.category, current);
    }
    return [...grouped.entries()].sort(([first], [second]) => first.localeCompare(second));
  }, [sortedServices]);

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

      <div id="interest-search" className="mb-8 grid gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr]">
        <div className="grid gap-2">
          <label htmlFor="service-category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="service-category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All categories" : category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="service-keyword" className="text-sm font-medium">
            Keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              id="service-keyword"
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search title, description, location, or vendor"
              className="pr-10 pl-9"
            />
            {keyword && (
              <button
                type="button"
                aria-label="Clear keyword"
                onClick={() => setKeyword("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="service-price-order" className="text-sm font-medium">
            Sort by price
          </label>
          <select
            id="service-price-order"
            value={priceOrder}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "recommended" || value === "ascending" || value === "descending") {
                setPriceOrder(value);
              }
            }}
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <option value="recommended">Recommended</option>
            <option value="ascending">Price: low to high</option>
            <option value="descending">Price: high to low</option>
          </select>
        </div>
      </div>

      {keyword.trim() && !loading && !error && (
        <p className="mb-5 text-sm text-muted-foreground" aria-live="polite">
          {services.length} {services.length === 1 ? "match" : "matches"} for “{keyword.trim()}”
        </p>
      )}

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
                  onClick={() => {
                    setSelectedCategory(category);
                    document.getElementById("interest-search")?.scrollIntoView({ behavior: "smooth" });
                  }}
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
