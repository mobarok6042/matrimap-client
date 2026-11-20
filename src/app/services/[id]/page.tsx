"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Compass,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Booking, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const serviceId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const { data: session } = useSession();
  const [service, setService] = React.useState<Service | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [eventDate, setEventDate] = React.useState("");
  const [eventLocation, setEventLocation] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [bookingSubmitting, setBookingSubmitting] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!serviceId) return;
    let active = true;

    apiFetch<Service>(`/api/services/${serviceId}`)
      .then((data) => {
        if (!active) return;
        setService(data);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load service:", err);
        setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [serviceId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="mb-2 size-8 animate-spin text-primary" />
          <p className="text-sm">Loading service details…</p>
        </div>
      </main>
    );
  }

  if (notFound || !service) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Compass className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Service not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The wedding service you are looking for could not be found.
          </p>
          <div className="mt-6">
            <Link href="/services" className={cn(buttonVariants(), "gap-2")}>
              <ArrowLeft className="size-4" /> Back to all services
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  const displayImage = service.image || service.images?.[0];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link href="/services" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 mb-4")}>
          <ArrowLeft className="size-4" /> Back to services
        </Link>

        <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900">
          {/* Service Image */}
          {displayImage ? (
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={displayImage}
                alt={service.title}
                className="size-full object-cover"
              />
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
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-primary/5 text-primary">
              <div className="size-14 rounded-full bg-primary/10" />
            </div>
          )}

          <CardContent className="flex flex-col gap-5 p-6">
            {/* Service Name */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {service.title}
              </h1>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span>{service.location}</span>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <p className="mt-2 text-sm text-foreground/90">{service.description}</p>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline justify-between rounded-xl border border-foreground/10 bg-foreground/5 p-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="size-3.5 text-primary" /> Starting from
                </p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  ৳ {service.price.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {service.pricingUnit || "event"}
                  </span>
                </p>
              </div>
            </div>

            {/* Vendor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendor Information</CardTitle>
                <CardDescription>Meet the professional behind this service.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{service.vendorName}</p>
                    <p className="text-sm text-muted-foreground">{service.vendorEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {service.phone && (
                <a href={`tel:${service.phone}`} className={cn(buttonVariants(), "flex-1 gap-2")}>
                  <Phone className="size-4" /> Call Now
                </a>
              )}
              <a
                href={`mailto:${service.email || service.vendorEmail}?subject=Inquiry: ${encodeURIComponent(service.title)}`}
                className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2")}
              >
                <Mail className="size-4" /> Send Email
              </a>
            </div>
          </CardContent>
        </div>
      </motion.div>
    </main>
  );
}
