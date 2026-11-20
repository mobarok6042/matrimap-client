"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import type { Profile } from "@/lib/types";

interface ProfileInput {
  displayName: string;
  bio: string;
  location: string;
  age?: string | number;
}

export function ProfileForm() {
  const [form, setForm] = React.useState<ProfileInput>({
    displayName: "",
    bio: "",
    location: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    apiFetch<Profile>("/api/profiles/me")
      .then((profile) => {
        if (!active) return;
        setForm({
          displayName: profile.displayName,
          bio: profile.bio ?? "",
          location: profile.location ?? "",
          age: profile.age,
        });
      })
      .catch((error: unknown) => {
        // A missing profile is expected for new users.
        if (!(error instanceof ApiError && error.status === 404)) {
          if (active) setMessage((error as Error).message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function update(field: keyof ProfileInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await apiFetch<Profile>("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : undefined,
        }),
      });
      setMessage("Profile saved.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={form.displayName}
          onChange={(event) => update("displayName", event.target.value)}
          minLength={2}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">About you</Label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={(event) => update("bio", event.target.value)}
          rows={3}
          maxLength={1000}
          className="border-input bg-background flex min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
            placeholder="Dhaka, Bangladesh"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={18}
            max={120}
            value={form.age ?? ""}
            onChange={(event) => update("age", event.target.value)}
          />
        </div>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <Button type="submit" disabled={saving} className="self-start">
        {saving && <Loader2 className="size-4 animate-spin" />}
        Save profile
      </Button>
    </form>
  );
}
