"use client";

import { useEffect } from "react";
import { animate } from "motion";

const HEADER_OFFSET = 96;

export function SmoothScroll() {
  useEffect(() => {
    let activeAnimation: ReturnType<typeof animate> | null = null;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href^='#']");
      if (!link || link.target === "_blank") return;

      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;

      event.preventDefault();
      window.history.pushState({}, "", link.hash);
      activeAnimation?.stop();

      const targetPosition = Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, targetPosition);
        return;
      }

      activeAnimation = animate(window.scrollY, targetPosition, {
        type: "spring",
        stiffness: 120,
        damping: 24,
        mass: 0.8,
        onUpdate: (position) => window.scrollTo(0, position),
      });
    };

    document.addEventListener("click", handleClick);
    return () => {
      activeAnimation?.stop();
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
