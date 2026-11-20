"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  DollarSign,
  Loader2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { CategoryServicesSection } from "@/components/category-services-section";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

const WHY_MATRIMAP = [
  {
    icon: CheckCircle2,
    title: "Admin-reviewed listings",
    description: "Explore services that have been reviewed before appearing in the marketplace.",
  },
  {
    icon: DollarSign,
    title: "Compare with clarity",
    description: "See service details, locations, and starting prices together as you plan.",
  },
  {
    icon: Calendar,
    title: "Requests in one place",
    description: "Send a booking request and follow its status from your customer dashboard.",
  },
];

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [seeding, setSeeding] = React.useState(false);
  const [activeContactService, setActiveContactService] = React.useState<Service | null>(null);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "admin";
  const pageCount = Math.max(1, Math.ceil(services.length / PAGE_SIZE));
  const pageServices = services.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const fetchServices = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Service[]>("/api/services");
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
        <div id="services-catalog" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            {!session && (
              <Link
                href="/auth?mode=sign-in"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </motion.div>

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
            No wedding services have been listed yet in the Atlas database.
          </p>

          {isAdmin && (
            <div className="mt-6 flex justify-center">
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
            </div>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageServices.map((service) => (
            <Card
              key={service._id}
              className="group flex h-full flex-col overflow-hidden border border-border bg-card/80 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg"
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
                  <span className="rounded-full border border-primary/30 bg-primary/85 px-2.5 py-1 text-[11px] font-medium text-primary-foreground backdrop-blur-md">
                    {service.category}
                  </span>
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/95 px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md">
                  <Star className="size-3 fill-secondary text-secondary" />
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
                {service.isAvailable === false && (
                  <span className="w-fit rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Inactive
                  </span>
                )}

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

      {!loading && services.length > PAGE_SIZE && (
        <nav className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row" aria-label="Service pages">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, services.length)} of {services.length} services
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <span className="px-2 text-sm text-muted-foreground" aria-live="polite">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            >
              Next
            </Button>
          </div>
        </nav>
      )}

      <CategoryServicesSection />

      <section className="mt-20 overflow-hidden rounded-3xl border border-border bg-card/70" aria-labelledby="why-matrimap">
        <div className="grid md:grid-cols-2">
          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Plan with confidence</p>
            <h2 id="why-matrimap" className="mt-2 text-3xl font-semibold tracking-tight">
              Why choose MatriMap?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Bring the details together, discover local wedding professionals, and keep your next steps organized.
            </p>
            <ul className="mt-8 space-y-5">
              {WHY_MATRIMAP.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-72 overflow-hidden md:min-h-full">
            <Image
              src="/why-matrimap.jpg"
              alt="A newlywed couple leaving their wedding ceremony surrounded by family and friends"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Vendor Contact Modal */}
      {activeContactService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-popover p-6 shadow-2xl"
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
