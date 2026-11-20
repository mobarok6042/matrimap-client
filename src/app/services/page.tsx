"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  DollarSign,
  Heart,
  Loader2,
  Eye,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  Sparkles,
  Star,
  Tag,
  User,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Service } from "@/lib/types";
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
];

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [seeding, setSeeding] = React.useState(false);
  const [activeContactService, setActiveContactService] = React.useState<Service | null>(null);

  const isVendor = (session?.user as { role?: string } | undefined)?.role === "vendor";

  const fetchServices = React.useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "All") {
        queryParams.set("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        queryParams.set("search", searchQuery.trim());
      }

      const queryString = queryParams.toString();
      const path = queryString ? `/api/services?${queryString}` : "/api/services";
      const data = await apiFetch<Service[]>(path);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void fetchServices();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  async function handleSeed() {
    setSeeding(true);
    try {
      await apiFetch("/api/services/seed", { method: "POST" });
      await fetchServices();
    } catch (err) {
      console.error("Failed to seed services:", err);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> Verified Wedding Marketplace
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Wedding Services
            </h1>
            <p className="mt-1 text-muted-foreground">
              Discover verified venues, photographers, caterers, and decorators for your dream day.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isVendor ? (
              <Link
                href="/services/add"
                className={cn(
                  buttonVariants({ size: "default" }),
                  "gap-2 bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20",
                )}
              >
                <PlusCircle className="size-4" /> Add Service
              </Link>
            ) : (
              !session && (
                <Link
                  href="/auth?mode=sign-in"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
                >
                  Vendor Sign in
                </Link>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter & Search Bar */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, service, location, or vendor…"
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-foreground/15 bg-white/50 text-foreground hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="mb-2 size-8 animate-spin text-primary" />
          <p className="text-sm">Fetching services from Atlas database…</p>
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="size-7" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">No services found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {searchQuery || selectedCategory !== "All"
              ? "No services match your active search or category filters. Try clearing your search."
              : "No wedding services have been listed yet in the Atlas database."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {searchQuery || selectedCategory !== "All" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                Clear all filters
              </Button>
            ) : (
              <>
                {isVendor && (
                  <Link href="/services/add" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
                    <PlusCircle className="size-4" /> Add the First Service
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={seeding}
                  onClick={handleSeed}
                  className="gap-2"
                >
                  {seeding && <Loader2 className="size-4 animate-spin" />}
                  Load Example Services
                </Button>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service._id}
              className="group flex h-full flex-col overflow-hidden border border-foreground/10 bg-white/70 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900/70"
            >
              {/* Service Cover Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
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
                <div className="absolute left-3 top-3">
                  <span className="rounded-full border border-black/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    {service.category}
                  </span>
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-zinc-900 shadow-sm backdrop-blur-md">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {service.rating ?? 5.0}
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                {/* Category */}
                <div>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {service.category}
                  </span>
                </div>

                {/* Service Name */}
                <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                {/* Service Image (rendered at the top of the card) */}
                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{service.location}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline justify-between border-t border-foreground/10 pt-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Starting from</span>
                    <p className="text-lg font-bold text-primary">
                      ৳ {service.price.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / {service.pricingUnit || "event"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Vendor Information */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <User className="size-3 shrink-0 text-muted-foreground" />
                  <span>Offered by: </span>
                  <strong className="truncate text-foreground">{service.vendorName}</strong>
                </div>

                {/* View Details Button */}
                <Button
                  size="sm"
                  onClick={() => router.push(`/services/${service._id}`)}
                  className="mt-auto w-full gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Eye className="size-3.5" /> View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Contact Modal */}
      {activeContactService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {activeContactService.category}
                </span>
                <h3 className="mt-2 text-xl font-bold text-foreground">
                  {activeContactService.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveContactService(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Offered by <strong className="text-foreground">{activeContactService.vendorName}</strong>
            </p>

            <div className="mt-6 space-y-3 rounded-xl border border-foreground/10 bg-foreground/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone / WhatsApp</p>
                  <p className="text-sm font-semibold text-foreground">
                    {activeContactService.phone || "Contact via email"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Inquiry Email</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {activeContactService.email || activeContactService.vendorEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service Location</p>
                  <p className="text-sm font-semibold text-foreground">
                    {activeContactService.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {activeContactService.phone && (
                <a
                  href={`tel:${activeContactService.phone}`}
                  className={cn(buttonVariants(), "flex-1 gap-2")}
                >
                  <Phone className="size-4" /> Call Now
                </a>
              )}
              <a
                href={`mailto:${activeContactService.email || activeContactService.vendorEmail}?subject=Inquiry: ${encodeURIComponent(activeContactService.title)}`}
                className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2")}
              >
                <Mail className="size-4" /> Send Email
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
