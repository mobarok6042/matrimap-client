"use client";

import * as React from "react";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Power,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { Service } from "@/lib/types";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor";
  isBlocked: boolean;
  createdAt: string;
}

export function AdminDashboard({ adminName }: { adminName: string }) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [servicesLoading, setServicesLoading] = React.useState(true);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [servicesError, setServicesError] = React.useState<string | null>(null);
  const [usersError, setUsersError] = React.useState<string | null>(null);
  const [serviceAction, setServiceAction] = React.useState<string | null>(null);
  const [userAction, setUserAction] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    apiFetch<Service[]>("/api/admin/services")
      .then((data) => {
        if (active) setServices(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setServicesError(error instanceof Error ? error.message : "Could not load services.");
        }
      })
      .finally(() => {
        if (active) setServicesLoading(false);
      });

    apiFetch<AdminUser[]>("/api/admin/users")
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setUsersError(error instanceof Error ? error.message : "Could not load users.");
        }
      })
      .finally(() => {
        if (active) setUsersLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function reviewService(id: string, decision: "approve" | "decline") {
    setServiceAction(id + decision);
    setServicesError(null);
    try {
      const updated = await apiFetch<Service>(`/api/admin/services/${id}/${decision}`, {
        method: "POST",
      });
      setServices((current) =>
        current.map((service) => (service._id === id ? updated : service))
      );
    } catch (error: unknown) {
      setServicesError(error instanceof Error ? error.message : "Could not update service.");
    } finally {
      setServiceAction(null);
    }
  }

  async function toggleServiceAvailability(service: Service) {
    const isAvailable = service.isAvailable === false;
    const action = isAvailable ? "activate" : "deactivate";
    setServiceAction(service._id + action);
    setServicesError(null);
    try {
      const updated = await apiFetch<Service>(
        `/api/admin/services/${service._id}/availability`,
        { method: "PATCH", body: JSON.stringify({ isAvailable }) },
      );
      setServices((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (error: unknown) {
      setServicesError(error instanceof Error ? error.message : "Could not update service.");
    } finally {
      setServiceAction(null);
    }
  }

  async function toggleUserBlock(user: AdminUser) {
    const action = user.isBlocked ? "unblock" : "block";
    setUserAction(user.id);
    setUsersError(null);
    try {
      const updated = await apiFetch<AdminUser>(`/api/admin/users/${user.id}/${action}`, {
        method: "POST",
      });
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error: unknown) {
      setUsersError(error instanceof Error ? error.message : "Could not update user.");
    } finally {
      setUserAction(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Admin control panel</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome, {adminName}</h1>
        <p className="mt-1 text-muted-foreground">
          Review service listings and manage customer and vendor access.
        </p>
      </header>

      <div className="grid gap-8">
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="size-5 text-primary" /> Manage services
            </CardTitle>
            <CardDescription>
              Review new listings and activate or deactivate approved services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {servicesError && <p role="alert" className="text-sm text-destructive">{servicesError}</p>}
            {servicesLoading ? (
              <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading services…
              </p>
            ) : services.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No services have been added yet.</p>
            ) : (
              services.map((service) => {
                const status = service.approvalStatus ?? "pending";

                return (
                  <article
                    key={service._id}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-background/60 p-4 sm:flex-row"
                  >
                    {service.image && (
                      <img
                        src={service.image}
                        alt=""
                        className="aspect-video w-full rounded-lg object-cover sm:w-44"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {service.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            status === "approved"
                              ? "bg-primary/10 text-primary"
                              : status === "declined"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-secondary/20 text-foreground"
                          }`}
                        >
                          {status === "approved" ? "Approved" : status === "declined" ? "Declined" : "Pending"}
                        </span>
                        {status === "approved" && (
                          <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-medium">
                            {service.isAvailable === false ? "Inactive" : "Active"}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold">{service.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Vendor: {service.vendorName} · ৳ {service.price.toLocaleString()} /{" "}
                        {service.pricingUnit || "event"}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" /> {service.location}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {status === "pending" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={serviceAction !== null}
                              onClick={() => reviewService(service._id, "approve")}
                            >
                              {serviceAction === service._id + "approve" ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="size-4" />
                              )}
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={serviceAction !== null}
                              onClick={() => reviewService(service._id, "decline")}
                            >
                              {serviceAction === service._id + "decline" ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <XCircle className="size-4" />
                              )}
                              Decline
                            </Button>
                          </>
                        )}
                        {status === "approved" && (
                          <Button
                            type="button"
                            size="sm"
                            variant={service.isAvailable === false ? "secondary" : "outline"}
                            disabled={serviceAction !== null}
                            onClick={() => toggleServiceAvailability(service)}
                          >
                            {serviceAction === service._id + (service.isAvailable === false ? "activate" : "deactivate") ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Power className="size-4" />
                            )}
                            {service.isAvailable === false ? "Activate" : "Deactivate"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" /> Customer and vendor accounts
            </CardTitle>
            <CardDescription>
              Blocked accounts cannot book services or publish listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersError && <p role="alert" className="text-sm text-destructive">{usersError}</p>}
            {usersLoading ? (
              <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading accounts…
              </p>
            ) : users.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No customer or vendor accounts found.</p>
            ) : (
              users.map((user) => (
                <article
                  key={user.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{user.name}</h2>
                      <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs capitalize">
                        {user.role}
                      </span>
                      {user.isBlocked && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                          Blocked
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={user.isBlocked ? "secondary" : "destructive"}
                    disabled={userAction !== null}
                    onClick={() => toggleUserBlock(user)}
                  >
                    {userAction === user.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : user.isBlocked ? (
                      <ShieldCheck className="size-4" />
                    ) : (
                      <Ban className="size-4" />
                    )}
                    {user.isBlocked ? "Unblock" : "Block"}
                  </Button>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
