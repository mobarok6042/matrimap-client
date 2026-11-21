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
import { ApiError, apiFetch, getUserFacingError } from "@/lib/api";
import { showErrorAlert, showSuccessAlert } from "@/lib/alerts";
import type { Booking, Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const serviceId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [service, setService] = React.useState<Service | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = React.useState(false);
  const [eventDate, setEventDate] = React.useState("");
  const [eventLocation, setEventLocation] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [bookingSubmitting, setBookingSubmitting] = React.useState(false);
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
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(getUserFacingError(err, "We could not load this service. Please try again."));
        }
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
    if (loadError) {
      return (
        <main className="mx-auto max-w-4xl px-4 py-12">
          <Card className="p-12 text-center">
            <h1 className="text-xl font-bold text-foreground">Service details unavailable</h1>
            <p role="alert" className="mt-2 text-sm text-muted-foreground">{loadError}</p>
            <Link href="/services" className={cn(buttonVariants(), "mt-5")}>
              Browse services
            </Link>
          </Card>
        </main>
      );
    }

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

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Service Image */}
          {displayImage ? (
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={displayImage}
                alt={service.title}
                className="size-full object-cover"
              />
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
            {service.isAvailable === false && (
              <p className="rounded-lg border border-secondary/50 bg-secondary/15 px-4 py-3 text-sm text-muted-foreground">
                This service is currently inactive and cannot accept booking requests.
              </p>
            )}

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

            {/* Contact + Book Service actions */}
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
              {role === "customer" && service.isAvailable !== false && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingOpen(true);
                    setBookingSuccess(false);
                  }}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "flex-1 gap-2"
                  )}
                >
                  <Calendar className="size-4" /> Book Service
                </button>
              )}
            </div>

            {/* Booking Form (slide-in) */}
            {bookingOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-secondary/50 bg-secondary/10 p-5"
              >
                <h3 className="text-base font-semibold text-foreground mb-1">Book this Service</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Customer:{" "}
                  <span className="font-medium">
                    {session?.user?.name || session?.user?.email}
                  </span>
                  {" · "}Vendor:{" "}
                  <span className="font-medium">{service.vendorName}</span>
                </p>

                {bookingSuccess ? (
                  <div className="rounded-lg bg-secondary/15 border border-secondary/50 px-4 py-3 text-sm text-foreground">
                    ✅ Booking request sent! The vendor will review your request shortly. You can track the status in your{" "}
                    <Link href="/dashboard" className="underline font-medium">
                      dashboard
                    </Link>
                    .
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBookingSubmitting(true);
                      try {
                        await apiFetch<Booking>("/api/bookings", {
                          method: "POST",
                          body: JSON.stringify({
                            serviceId: service._id,
                            eventDate,
                            eventLocation,
                            message,
                          }),
                        });
                        setBookingSuccess(true);
                        setEventDate("");
                        setEventLocation("");
                        setMessage("");
                        void showSuccessAlert("Booking request sent");
                      } catch (err: unknown) {
                        await showErrorAlert(
                          getUserFacingError(err, "We could not send your booking request. Please try again."),
                          "Booking request could not be sent",
                        );
                      } finally {
                        setBookingSubmitting(false);
                      }
                    }}
                    className="flex flex-col gap-4"
                  >
                    {/* Event Date */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="eventDate" className="text-sm font-medium text-foreground">
                        Event Date <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="eventDate"
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow]"
                      />
                    </div>

                    {/* Event Location */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="eventLocation" className="text-sm font-medium text-foreground">
                        Event Location <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="eventLocation"
                        type="text"
                        required
                        placeholder="e.g. Dhaka Convention Center, Hall 3"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        maxLength={120}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow]"
                      />
                    </div>

                    {/* Additional Message */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="bookingMessage" className="text-sm font-medium text-foreground">
                        Additional Message{" "}
                        <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <textarea
                        id="bookingMessage"
                        placeholder="Describe your requirements, guest count, special requests…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={2000}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] resize-none"
                      />
                      <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={bookingSubmitting}
                        className={cn(
                          buttonVariants(),
                          "flex-1 gap-2 disabled:opacity-60"
                        )}
                      >
                        {bookingSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" /> Sending…
                          </>
                        ) : (
                          <>
                            <Calendar className="size-4" /> Confirm Booking
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingOpen(false);
                        }}
                        className={cn(buttonVariants({ variant: "outline" }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </CardContent>
        </div>
      </motion.div>
    </main>
  );
}
