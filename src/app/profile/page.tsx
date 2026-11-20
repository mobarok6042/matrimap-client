"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Camera, CheckCircle2, MapPin, Shield, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { ProfileForm } from "@/components/profile-form";
import { buttonVariants } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import type { UserRole } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    setImageError(false);
    if (!session?.user) return;
    if (session.user.image) {
      setAvatarUrl(session.user.image);
    }
    apiFetch<Profile>("/api/profiles/me")
      .then((p) => {
        setProfile(p);
        if (p?.images?.[0]) {
          setAvatarUrl(p.images[0]);
        }
      })
      .catch(() => {});
  }, [session]);

  async function handleImageUploaded(url: string) {
    setAvatarUrl(url);
    setImageError(false);
    setSyncStatus("Updating profile photo…");

    try {
      const currentDisplayName =
        profile?.displayName || session?.user?.name || session?.user?.email?.split("@")[0] || "User";
      const updated = await apiFetch<Profile>("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          displayName: currentDisplayName,
          bio: profile?.bio,
          location: profile?.location,
          age: profile?.age,
          images: [url],
        }),
      });
      setProfile(updated);

      await authClient.updateUser({
        image: url,
      } as unknown as Parameters<typeof authClient.updateUser>[0]);
      await refetch();
      setSyncStatus("Profile photo updated successfully!");
      setTimeout(() => setSyncStatus(null), 3500);
    } catch {
      setSyncStatus("Photo uploaded to ImgBB.");
      setTimeout(() => setSyncStatus(null), 3500);
    }
  }

  function handleProfileSaved(saved: Profile) {
    setProfile(saved);
    if (saved.images?.[0]) {
      setAvatarUrl(saved.images[0]);
      setImageError(false);
    }
  }

  if (isPending) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading profile…</main>;
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Sign in to view and edit your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth?mode=sign-in" className={cn(buttonVariants())}>
              Go to sign in
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const role = (session.user as { role?: UserRole }).role;
  const displayName = profile?.displayName || session.user.name || session.user.email?.split("@")[0] || "User";

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Medium size profile picture & header */}
        <Card className="overflow-hidden border border-foreground/10 bg-white/60 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Medium size profile picture (size-28 / 112px) */}
              <div className="relative shrink-0">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setImageError(true)}
                    className="size-28 rounded-full object-cover ring-4 ring-primary/20 shadow-lg"
                  />
                ) : (
                  <div className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-primary/20 shadow-lg">
                    <User className="size-14" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <Camera className="size-3.5" />
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                    <Shield className="size-3 text-primary" />
                    {role ?? "Customer"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-muted-foreground sm:justify-start">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" /> {profile.location}
                    </span>
                  )}
                  {profile?.age && (
                    <span>
                      Age: <strong className="text-foreground">{profile.age}</strong>
                    </span>
                  )}
                </div>

                {profile?.bio && (
                  <p className="pt-1 text-sm text-muted-foreground/90">{profile.bio}</p>
                )}

                {syncStatus && (
                  <p className="flex items-center gap-1.5 pt-1 text-xs text-primary">
                    <CheckCircle2 className="size-3.5" /> {syncStatus}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6">
        {/* Profile Photo Update */}
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>
              Upload a new photo to ImgBB to update your medium profile picture and avatar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload onUploaded={handleImageUploaded} />
          </CardContent>
        </Card>

        {/* Profile Details Update */}
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Update your display name, location, age, and bio for the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm onSaved={handleProfileSaved} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
