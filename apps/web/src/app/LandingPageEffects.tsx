"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function formatCount(
  value: number,
  decimals: number,
  prefix: string,
  suffix: string,
) {
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${formatted}${suffix}`;
}

export function LandingPageEffects() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const heroLines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
      if (heroLines.length > 0) {
        gsap.from(heroLines, {
          yPercent: 110,
          opacity: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
          clearProps: "all",
        });
      }

      const revealGroups = gsap.utils.toArray<HTMLElement>(
        "[data-reveal-group]",
      );
      revealGroups.forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-reveal]");
        if (items.length === 0) {
          return;
        }

        gsap.from(items, {
          y: 32,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          clearProps: "all",
          scrollTrigger: {
            trigger: group,
            start: "top 82%",
            once: true,
          },
        });
      });

      const mediaItems = gsap.utils.toArray<HTMLElement>("[data-media-reveal]");
      mediaItems.forEach((item) => {
        gsap.from(item, {
          scale: 0.94,
          y: 28,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            once: true,
          },
        });
      });

      const floatingCards = gsap.utils.toArray<HTMLElement>("[data-float]");
      floatingCards.forEach((card, index) => {
        gsap.to(card, {
          y: index % 2 === 0 ? -14 : 14,
          x: index % 2 === 0 ? 10 : -10,
          duration: 4.6 + index,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      const scrubYItems = gsap.utils.toArray<HTMLElement>("[data-scrub-y]");
      scrubYItems.forEach((item) => {
        const amount = Number(item.dataset.scrubY ?? "0");
        gsap.to(item, {
          y: amount,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      const scrubXItems = gsap.utils.toArray<HTMLElement>("[data-scrub-x]");
      scrubXItems.forEach((item) => {
        const amount = Number(item.dataset.scrubX ?? "0");
        gsap.to(item, {
          x: amount,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      const parallaxItems = gsap.utils.toArray<HTMLElement>("[data-parallax]");
      parallaxItems.forEach((item) => {
        const amount = Number(item.dataset.parallax ?? "0.1") * 100;
        gsap.to(item, {
          yPercent: -amount,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      const barFills = gsap.utils.toArray<HTMLElement>("[data-bar-fill]");
      barFills.forEach((bar) => {
        gsap.from(bar, {
          scaleX: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bar,
            start: "top 88%",
            once: true,
          },
        });
      });

      const counters = gsap.utils.toArray<HTMLElement>("[data-count-up]");
      counters.forEach((counter) => {
        const target = Number(counter.dataset.countUp ?? "0");
        const decimals = Number(counter.dataset.decimals ?? "0");
        const prefix = counter.dataset.prefix ?? "";
        const suffix = counter.dataset.suffix ?? "";
        const value = { amount: 0 };

        gsap.to(value, {
          amount: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: counter,
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            counter.textContent = formatCount(
              value.amount,
              decimals,
              prefix,
              suffix,
            );
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
