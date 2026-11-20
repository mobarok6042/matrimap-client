"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Card as HeroCard, Chip } from "@heroui/react";
import { MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";

export function ProfileList() {
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    apiFetch<Profile[]>("/api/profiles")
      .then((data) => {
        if (active) setProfiles(data);
      })
      .catch((caught: unknown) => {
        if (active) setError((caught as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading profiles…</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (profiles.length === 0) {
    return (
      <p className="text-muted-foreground">
        No profiles yet. Sign in and create the first one from your dashboard.
      </p>
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {profiles.map((profile) => (
        <motion.div
          key={profile._id}
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
        >
          <HeroCard className="h-full">
            <HeroCard.Header className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <HeroCard.Title>{profile.displayName}</HeroCard.Title>
                {profile.isPremium && (
                  <Chip color="success" variant="soft" size="sm">
                    Premium
                  </Chip>
                )}
              </div>
              {profile.location && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3" /> {profile.location}
                </span>
              )}
            </HeroCard.Header>
            <HeroCard.Content>
              <p className="text-sm text-muted-foreground">{profile.bio || "No bio yet."}</p>
            </HeroCard.Content>
          </HeroCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
