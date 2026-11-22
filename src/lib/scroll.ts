"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Section = "about" | "experience" | "projects" | "skills" | "milestones" | "certifications" | "contact";

// Sections that live inside another section's pinned timeline
const HOST: Partial<Record<Section, Section>> = { skills: "projects", certifications: "milestones", contact: "milestones" };

/** The scroll position where a home section is fully in view, or null if it isn't on this page. */
export function sectionY(name: Section): number | null {
  const st = ScrollTrigger.getById(`${HOST[name] ?? name}-reveal`);
  const tl = st?.animation as gsap.core.Timeline | undefined;
  if (st && tl && tl.labels[name] !== undefined) {
    return st.start + (st.end - st.start) * (tl.labels[name] / tl.duration());
  }
  const el = document.getElementById(name);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
}

let active: gsap.core.Tween | null = null;
let stopListening: (() => void) | null = null;

/** Scrolls to a home section. Animated with GSAP (not the browser's smooth scroll, which
 *  gets cancelled whenever a pinned section refreshes mid-way) and re-aimed every frame. */
export function scrollToSection(name: Section | "top", smooth = true) {
  const y = name === "top" ? 0 : sectionY(name);
  if (y === null) return;
  active?.kill();
  stopListening?.();
  if (!smooth || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: y, behavior: "instant" });
    return;
  }
  const start = window.scrollY;
  const state = { v: 0 };
  const stop = () => {
    active?.kill();
    stopListening?.();
  };
  const opts: AddEventListenerOptions = { passive: true };
  window.addEventListener("wheel", stop, opts);
  window.addEventListener("touchstart", stop, opts);
  window.addEventListener("keydown", stop);
  stopListening = () => {
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
    stopListening = null;
  };
  const dist = Math.abs(y - window.scrollY);
  active = gsap.to(state, {
    v: 1,
    duration: Math.min(1.6, Math.max(0.6, dist / 4000)),
    ease: "power3.inOut",
    onUpdate: () => {
      const target = name === "top" ? 0 : (sectionY(name) ?? y);
      window.scrollTo({ top: start + (target - start) * state.v, behavior: "instant" }); // "instant": the page CSS has smooth scrolling on
    },
    onComplete: () => stopListening?.(),
  });
}

export const scrollToAbout = (smooth = true) => scrollToSection("about", smooth);
