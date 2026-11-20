"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative min-h-[580px] w-full overflow-hidden border-b sm:min-h-[680px] lg:min-h-[740px]">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover object-center"
      >
        <source src="/banner-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for contrast and legibility */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[0.5px]" />

      {/* Gradient vignette blending seamlessly into page theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/60" />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[580px] max-w-5xl flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:min-h-[680px] sm:py-32 lg:min-h-[740px]"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.12 }}
      >
        {/* Subtle pill tag */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5 text-amber-300" />
            <span>Premium Matrimony & Wedding Planning</span>
          </div>
        </motion.div>

        {/* Clear Headline Title */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="max-w-4xl text-balance text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-6xl md:text-7xl"
        >
          Find Your Perfect Match & Plan Your Dream Wedding
        </motion.h1>

        {/* Short Description */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="max-w-2xl text-balance text-base font-normal text-white/90 drop-shadow-sm sm:text-lg md:text-xl"
        >
          Discover top-rated wedding vendors, bridal services, venues, and verified
          matrimonial connections mapped with care for your special day.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-2 flex items-center justify-center"
        >
          <Link
            href="/services"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90",
            )}
          >
            Explore Wedding Services
            <ArrowRight className="ml-1 size-5" />
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-white/80 sm:text-sm"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" /> Verified Profiles
          </span>
          <span className="flex items-center gap-2">
            <HeartHandshake className="size-4 text-rose-300" /> Trusted Vendors
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-300" /> Seamless Planning
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

export { Hero as BannerSection };
