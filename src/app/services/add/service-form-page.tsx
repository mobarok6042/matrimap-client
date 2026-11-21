"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  DollarSign,
  FileImage,
  ImageIcon,
  Loader2,
  MapPin,
  Phone,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { apiFetch, getUserFacingError } from "@/lib/api";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
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

const PRICING_UNITS = [
  "per event",
  "per day",
  "per plate",
  "package",
  "per hour",
];

interface UploadResponse {
  id: string;
  url: string;
  displayUrl: string;
  deleteUrl: string;
}

export default function AddServicePage() {
  return <ServiceForm />;
}

export function ServiceForm({ serviceId }: { serviceId?: string }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Form State
  const [serviceName, setServiceName] = React.useState("");
  const [serviceCategory, setServiceCategory] = React.useState(CATEGORIES[0]);
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [pricingUnit, setPricingUnit] = React.useState(PRICING_UNITS[0]);
  const [location, setLocation] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Service Image Upload via ImgBB
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = React.useState(false);
  const [imageUploadError, setImageUploadError] = React.useState<string | null>(null);

  // Form Submit State
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [serviceLoading, setServiceLoading] = React.useState(Boolean(serviceId));
  const [serviceLoadError, setServiceLoadError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Initialize email with vendor's account email
  React.useEffect(() => {
    if (session?.user?.email && !email) {
      setEmail(session.user.email);
    }
  }, [session, email]);

  React.useEffect(() => {
    if (!serviceId || isPending || role !== "vendor") return;
    let active = true;

    apiFetch<Service>(`/api/services/${serviceId}/manage`)
      .then((service) => {
        if (!active) return;
        setServiceName(service.title);
        setServiceCategory(service.category);
        setDescription(service.description);
        setPrice(String(service.price));
        setPricingUnit(service.pricingUnit || PRICING_UNITS[0]);
        setLocation(service.location);
        setPhone(service.phone || "");
        setEmail(service.email || "");
        setImageUrl(service.image || service.images?.[0] || "");
      })
      .catch((caught: unknown) => {
        if (active) {
          setServiceLoadError(
            getUserFacingError(caught, "We could not load this service. Please try again."),
          );
        }
      })
      .finally(() => {
        if (active) setServiceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [serviceId, isPending, role]);

  // Handle direct file selection and automatic upload to ImgBB
  async function handleFileSelected(file: File) {
    setImageFile(file);
    setImageUploadError(null);
    setImageUploadSuccess(false);
    setUploadingImage(true);

    try {
      const body = new FormData();
      body.append("image", file);

      const res = await apiFetch<UploadResponse>("/api/upload/image", {
        method: "POST",
        body,
      });

      if (!res.displayUrl && !res.url) {
        throw new Error("ImgBB did not return an image URL.");
      }

      const uploadedUrl = res.displayUrl || res.url;
      setImageUrl(uploadedUrl);
      setImageUploadSuccess(true);
    } catch (caught) {
      const msg = getUserFacingError(caught, "We could not upload this image. Please try again.");
      setImageUploadError(msg);
      setImageUrl("");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handleFileSelected(file);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImageUrl("");
    setImageUploadSuccess(false);
    setImageUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validation checks
    if (!serviceName.trim()) {
      setError("Please provide a Service Name.");
      return;
    }
    if (!serviceCategory) {
      setError("Please select a Service Category.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid positive Price amount.");
      return;
    }
    if (!location.trim()) {
      setError("Please provide a Location.");
      return;
    }
    if (!imageUrl) {
      setError("Service Image is mandatory. Please upload an image file using ImgBB.");
      return;
    }

    setBusy(true);

    try {
      await apiFetch<Service>(serviceId ? `/api/services/${serviceId}` : "/api/services", {
        method: serviceId ? "PUT" : "POST",
        body: JSON.stringify({
          title: serviceName.trim(),
          serviceName: serviceName.trim(),
          category: serviceCategory,
          serviceCategory,
          price: priceNum,
          pricingUnit,
          location: location.trim(),
          description: description.trim(),
          image: imageUrl,
          serviceImage: imageUrl,
          phone: phone.trim(),
          email: email.trim() || session?.user?.email,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(serviceId ? "/vendor" : "/dashboard");
        router.refresh();
      }, 1500);
    } catch (caught) {
      setError(getUserFacingError(caught, "We could not publish this service. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (isPending || (serviceId && role === "vendor" && serviceLoading)) {
    return (
      <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Verifying vendor authorization…
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldAlert className="size-6" />
            </div>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>
              You must sign in as a registered vendor to add and offer wedding services.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/auth?mode=sign-in" className={cn(buttonVariants(), "w-full")}>
              Sign in as Vendor
            </Link>
            <Link href="/services" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              Back to Services
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (role !== "vendor") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <Card className="border-destructive/30 text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" />
            </div>
            <CardTitle className="text-xl">Vendor Access Only</CardTitle>
            <CardDescription>
              Your account is signed in as a <strong className="text-foreground capitalize">{role ?? "Customer"}</strong>.
              Only verified vendor accounts have permissions to list wedding services in the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/services" className={cn(buttonVariants(), "w-full")}>
              Browse Wedding Services
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (serviceLoadError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Unable to edit service</CardTitle>
            <CardDescription role="alert">{serviceLoadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vendor" className={cn(buttonVariants())}>
              Back to vendor dashboard
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-4">
          <Link
            href={serviceId ? "/vendor" : "/services"}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> {serviceId ? "Back to Vendor Dashboard" : "Back to Services"}
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {serviceId ? "Edit Wedding Service" : "Add Wedding Service"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Fill in the required service details and upload your showcase photo using ImgBB.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> Vendor Portal
          </div>
        </div>

        {success ? (
          <Card className="border-secondary/50 bg-secondary/10 p-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-secondary/20 text-foreground">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {serviceId ? "Service Updated" : "Service Submitted for Review"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {serviceId
                ? "Your changes were saved and the service is pending administrator review."
                : "Your listing will appear in the services catalog after an administrator approves it."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={serviceId ? "/vendor" : "/dashboard"} className={cn(buttonVariants())}>
                {serviceId ? "Go to Vendor Dashboard" : "Go to Dashboard"}
              </Link>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="size-5 text-primary" /> Service Details
                </CardTitle>
                <CardDescription>
                  Enter the core information about the wedding service you are offering.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 1. Service Name */}
                <div className="grid gap-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g., Royal Candid Wedding Photography & Cinematography"
                    minLength={3}
                    maxLength={120}
                    required
                  />
                </div>

                {/* 2. Service Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="serviceCategory">Service Category *</Label>
                    <select
                      id="serviceCategory"
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Location */}
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Gulshan-2, Dhaka"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Price & Pricing Unit */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (BDT / USD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g., 45000"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pricingUnit">Pricing Unit</Label>
                    <select
                      id="pricingUnit"
                      value={pricingUnit}
                      onChange={(e) => setPricingUnit(e.target.value)}
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      {PRICING_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a comprehensive description of the service, package inclusions, deliverables, crew details, and policies…"
                    className="border-input bg-background flex min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    minLength={10}
                    maxLength={2000}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* 6. Service Image (uploaded as file using ImgBB) */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Camera className="size-5 text-primary" /> Service Image *
                  </CardTitle>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Hosted on ImgBB
                  </span>
                </div>
                <CardDescription>
                  Upload your service cover image file. It will be uploaded and hosted securely via ImgBB.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  id="serviceImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!imageUrl && !uploadingImage && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-foreground/20 bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
                  >
                    <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UploadCloud className="size-7" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Click to choose an image file from your device
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 5 MB — automatically uploaded to ImgBB
                    </p>
                  </div>
                )}

                {uploadingImage && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
                    <Loader2 className="mb-3 size-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Uploading image file to ImgBB…
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please wait while your image is processed and hosted.
                    </p>
                  </div>
                )}

                {imageUrl && !uploadingImage && (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-2xl border border-foreground/15 shadow-sm">
                      <img
                        src={imageUrl}
                        alt="Uploaded Service Cover"
                        className="h-56 w-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-primary/85 px-3 py-1 text-xs font-medium text-secondary backdrop-blur-md">
                        <CheckCircle2 className="size-3.5" /> Uploaded to ImgBB
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        aria-label="Remove and re-upload image"
                        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate max-w-[80%]">
                        Hosted URL: <strong className="text-foreground">{imageUrl}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                )}

                {imageUploadError && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{imageUploadError}</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="ml-auto font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optional Vendor Direct Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="size-4 text-primary" /> Vendor Inquiries
                </CardTitle>
                <CardDescription>
                  Customer communication details for booking and questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1711 000000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Inquiry Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@matrimap.com"
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href={serviceId ? "/vendor" : "/services"} className={cn(buttonVariants({ variant: "outline" }))}>
                Cancel
              </Link>
              <Button
                type="submit"
                size="lg"
                disabled={busy || uploadingImage}
                className="gap-2"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {serviceId ? "Saving changes…" : "Publishing to Atlas…"}
                  </>
                ) : (
                  <>
                    <PlusCircle className="size-4" />
                    {serviceId ? "Save Changes" : "Publish Service"}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
