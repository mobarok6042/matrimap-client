"use client";

import { useEffect } from "react";
import { animate } from "motion";

const HEADER_OFFSET = 96;

export function SmoothScroll() {
  useEffect(() => {
    let activeAnimation: ReturnType<typeof animate> | null = null;
    let previousScrollBehavior = "";

    const stopAnimation = () => {
      activeAnimation?.stop();
      activeAnimation = null;

      if (previousScrollBehavior) {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
        previousScrollBehavior = "";
      }
    };

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
      stopAnimation();

      const targetPosition = Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo({ top: targetPosition, behavior: "auto" });
        return;
      }

      // Drive the scroll position from one animation. Otherwise CSS smooth
      // scrolling can try to smooth every frame and make the motion stutter.
      previousScrollBehavior = getComputedStyle(document.documentElement).scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";

      const distance = Math.abs(targetPosition - window.scrollY);
      activeAnimation = animate(window.scrollY, targetPosition, {
        type: "tween",
        duration: Math.min(0.8, Math.max(0.4, distance / 1800)),
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (position) => window.scrollTo(0, position),
        onComplete: () => {
          activeAnimation = null;
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
          previousScrollBehavior = "";
        },
      });
    };

    const cancelOnUserInput = () => stopAnimation();

    document.addEventListener("click", handleClick);
    window.addEventListener("wheel", cancelOnUserInput, { passive: true });
    window.addEventListener("touchstart", cancelOnUserInput, { passive: true });
    window.addEventListener("keydown", cancelOnUserInput);
    return () => {
      stopAnimation();
      document.removeEventListener("click", handleClick);
      window.removeEventListener("wheel", cancelOnUserInput);
      window.removeEventListener("touchstart", cancelOnUserInput);
      window.removeEventListener("keydown", cancelOnUserInput);
    };
  }, []);

  return null;
}
