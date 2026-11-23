"use client";

import * as React from "react";
import {
  Ban,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Power,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, getUserFacingError } from "@/lib/api";
import { confirmAction, showErrorAlert, showSuccessAlert } from "@/lib/alerts";
import type { PaymentTransaction, Service } from "@/lib/types";

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
  const [payments, setPayments] = React.useState<PaymentTransaction[]>([]);
  const [servicesLoading, setServicesLoading] = React.useState(true);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [paymentsLoading, setPaymentsLoading] = React.useState(true);
  const [servicesError, setServicesError] = React.useState<string | null>(null);
  const [usersError, setUsersError] = React.useState<string | null>(null);
  const [paymentsError, setPaymentsError] = React.useState<string | null>(null);
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
          setServicesError(getUserFacingError(error, "We could not load services. Please try again."));
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
          setUsersError(getUserFacingError(error, "We could not load accounts. Please try again."));
        }
      })
      .finally(() => {
        if (active) setUsersLoading(false);
      });

    apiFetch<PaymentTransaction[]>("/api/admin/payments")
      .then((data) => {
        if (active) setPayments(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setPaymentsError(getUserFacingError(error, "We could not load payments. Please try again."));
        }
      })
      .finally(() => {
        if (active) setPaymentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function reviewService(id: string, decision: "approve" | "decline") {
    if (decision === "decline") {
      const confirmed = await confirmAction({
        title: "Decline this service?",
        text: "The vendor will not be able to publish this service until it is approved.",
        confirmText: "Decline service",
      });
      if (!confirmed) return;
    }

    setServiceAction(id + decision);
    setServicesError(null);
    try {
      const updated = await apiFetch<Service>(`/api/admin/services/${id}/${decision}`, {
        method: "POST",
      });
      setServices((current) =>
        current.map((service) => (service._id === id ? updated : service))
      );
      void showSuccessAlert(`Service ${decision === "approve" ? "approved" : "declined"}`);
    } catch (error: unknown) {
      await showErrorAlert(
        getUserFacingError(error, "We could not update this service. Please try again."),
        "Service could not be updated",
      );
    } finally {
      setServiceAction(null);
    }
  }

  async function toggleServiceAvailability(service: Service) {
    const isAvailable = service.isAvailable === false;
    const action = isAvailable ? "activate" : "deactivate";
    if (!isAvailable) {
      const confirmed = await confirmAction({
        title: "Deactivate this service?",
        text: "Customers will no longer be able to find or book this service.",
        confirmText: "Deactivate service",
      });
      if (!confirmed) return;
    }

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
      void showSuccessAlert(`Service ${isAvailable ? "activated" : "deactivated"}`);
    } catch (error: unknown) {
      await showErrorAlert(
        getUserFacingError(error, "We could not update this service. Please try again."),
        "Service availability could not be updated",
      );
    } finally {
      setServiceAction(null);
    }
  }

  async function toggleUserBlock(user: AdminUser) {
    const action = user.isBlocked ? "unblock" : "block";
    const confirmed = await confirmAction({
      title: user.isBlocked ? "Unblock this account?" : "Block this account?",
      text: user.isBlocked
        ? "The user will regain access to protected platform features."
        : "The user will lose access to protected platform features.",
      confirmText: user.isBlocked ? "Unblock account" : "Block account",
      destructive: !user.isBlocked,
    });
    if (!confirmed) return;

    setUserAction(user.id);
    setUsersError(null);
    try {
      const updated = await apiFetch<AdminUser>(`/api/admin/users/${user.id}/${action}`, {
        method: "POST",
      });
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      void showSuccessAlert(`Account ${user.isBlocked ? "unblocked" : "blocked"}`);
    } catch (error: unknown) {
      await showErrorAlert(
        getUserFacingError(error, "We could not update this account. Please try again."),
        "Account could not be updated",
      );
    } finally {
      setUserAction(null);
    }
  }

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-hidden sm:space-y-6">
      <header id="overview" className="mb-2 scroll-mt-24">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Admin control panel</p>
        <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome, {adminName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review service listings and manage customer and vendor access.
        </p>
      </header>

      <section aria-label="Platform statistics" className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        {[
          {
            label: "Service listings",
            value: servicesLoading ? "—" : String(services.length),
            icon: Clock3,
          },
          {
            label: "Pending review",
            value: servicesLoading
              ? "—"
              : String(services.filter((service) => (service.approvalStatus ?? "pending") === "pending").length),
            icon: Clock3,
          },
          {
            label: "Vendor accounts",
            value: usersLoading ? "—" : String(users.filter((user) => user.role === "vendor").length),
            icon: UserRound,
          },
          {
            label: "Plan payments",
            value: paymentsLoading ? "—" : String(payments.length),
            icon: CreditCard,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-xl border border-border bg-card p-3 shadow-sm sm:rounded-2xl sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium leading-tight text-muted-foreground sm:text-sm">{stat.label}</p>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10 sm:rounded-xl">
                  <Icon className="size-4 sm:size-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:mt-4 sm:text-3xl">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-8">
        <Card id="vendor-plan-payments" className="scroll-mt-24 max-w-full overflow-hidden border-border bg-card">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex min-w-0 items-start gap-2">
              <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="break-words">Vendor plan payments</span>
            </CardTitle>
            <CardDescription>Vendor plan charges, session details, and payment status from Stripe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 sm:px-6">
            {paymentsError && <p role="alert" className="text-sm text-destructive">{paymentsError}</p>}
            {paymentsLoading ? (
              <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading payments…
              </p>
            ) : payments.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No vendor plan payments found.</p>
            ) : (
              <>
                <div className="space-y-3 lg:hidden">
                {payments.map((payment) => (
                  <article key={payment._id} className="min-w-0 rounded-xl border border-border bg-background/60 p-4">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-semibold capitalize">{payment.plan} plan</p>
                        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                          {payment.vendorId}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          payment.status === "paid"
                            ? "bg-primary/10 text-primary"
                            : payment.status === "failed" || payment.status === "expired"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-secondary/30 text-secondary-foreground"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <dl className="mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm min-[420px]:grid-cols-2">
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Amount</dt>
                        <dd className="mt-1 font-medium">
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency: payment.currency.toUpperCase(),
                          }).format(payment.amount / 100)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Created</dt>
                        <dd className="mt-1 break-words">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="min-w-0 min-[420px]:col-span-2">
                        <dt className="text-xs text-muted-foreground">Stripe session</dt>
                        <dd className="mt-1 break-all font-mono text-xs">{payment.stripeSessionId}</dd>
                      </div>
                      <div className="min-w-0 min-[420px]:col-span-2">
                        <dt className="text-xs text-muted-foreground">Subscription</dt>
                        <dd className="mt-1 break-all font-mono text-xs">
                          {payment.stripeSubscriptionId || "—"}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
                </div>
                <div className="hidden overflow-x-auto rounded-xl border border-border lg:block">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Vendor ID</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Plan</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Amount</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Currency</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Stripe session ID</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Stripe subscription ID</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Created at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="align-top">
                        <td className="max-w-40 break-all px-4 py-3 font-mono text-xs">
                          {payment.vendorId}
                        </td>
                        <td className="px-4 py-3 font-medium capitalize">{payment.plan}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency: payment.currency.toUpperCase(),
                          }).format(payment.amount / 100)}
                        </td>
                        <td className="px-4 py-3 uppercase">{payment.currency}</td>
                        <td className="max-w-52 break-all px-4 py-3 font-mono text-xs">
                          {payment.stripeSessionId}
                        </td>
                        <td className="max-w-52 break-all px-4 py-3 font-mono text-xs">
                          {payment.stripeSubscriptionId || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              payment.status === "paid"
                                ? "bg-primary/10 text-primary"
                                : payment.status === "failed" || payment.status === "expired"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-secondary/30 text-secondary-foreground"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          <time dateTime={payment.createdAt}>
                            {new Date(payment.createdAt).toLocaleString()}
                          </time>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card id="manage-services" className="scroll-mt-24 max-w-full overflow-hidden border-border bg-card">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex min-w-0 items-start gap-2">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="break-words">Manage services</span>
            </CardTitle>
            <CardDescription>
              Review new listings and activate or deactivate approved services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
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
                      <h2 className="break-words text-lg font-semibold">{service.title}</h2>
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
                              className="w-full sm:w-auto"
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
                              className="w-full sm:w-auto"
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
                            className="w-full sm:w-auto"
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

        <Card id="managed-accounts" className="scroll-mt-24 max-w-full overflow-hidden border-border bg-card">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex min-w-0 items-start gap-2">
              <UserRound className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="break-words">Customer and vendor accounts</span>
            </CardTitle>
            <CardDescription>
              Blocked accounts cannot use protected account features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 sm:px-6">
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
                    className="w-full sm:w-auto"
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
    </div>
  );
}
