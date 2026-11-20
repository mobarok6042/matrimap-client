"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Button as HeroButton, Chip } from "@heroui/react";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden border-b">
      <div className="pointer-events-none absolute -top-24 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.12 }}
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Chip variant="tertiary" color="accent" size="sm">
            <Sparkles className="size-3" /> Now in early access
          </Chip>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Meaningful connections, mapped with care.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-base text-muted-foreground sm:text-lg"
        >
          MatriMap is a modern matrimony starter built with Next.js, Express, MongoDB and a
          hand-picked set of tools for auth, payments and image hosting.
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <HeroButton variant="primary" size="lg" onPress={() => router.push("/auth")}>
            Create your profile <ArrowRight className="size-4" />
          </HeroButton>
          <Link href="/profiles" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Browse profiles
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Secure sign-in
          </span>
          <span className="flex items-center gap-2">
            <HeartHandshake className="size-4 text-primary" /> Verified profiles
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Premium upgrades
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
