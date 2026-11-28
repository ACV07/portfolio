"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Caps how fast the mouse wheel / trackpad can move the page. The home page is made of pinned,
 * scrubbed sections, so a hard flick used to jump straight over whole sections and their
 * animations. Here every wheel tick only moves a target; the page follows it at a limited
 * speed, so each section plays through. Touch, keyboard and the scrollbar are left alone.
 */
const MAX_SCREENS_PER_SECOND = 1.7; // top speed, in screen heights
const MAX_LEAD = 1.2; // the target never gets further than this many screens ahead

export default function SpeedLimit() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let target = window.scrollY;
    let pos = window.scrollY;
    let driving = false;

    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

    const tick = (_t: number, dtMs: number) => {
      if (!driving) {
        // Someone else moved the page (scrollbar, keys, menu, snapping): follow it
        if (Math.abs(window.scrollY - pos) > 1) pos = target = window.scrollY;
        return;
      }
      const dt = Math.min(dtMs, 50) / 1000;
      const maxStep = window.innerHeight * MAX_SCREENS_PER_SECOND * dt;
      const diff = target - pos;
      // ease out near the target, never faster than maxStep
      const step = clamp(diff * Math.min(1, dt * 10), -maxStep, maxStep);
      pos += Math.abs(diff) < 0.5 ? diff : step;
      window.scrollTo({ top: pos, behavior: "instant" }); // the page CSS has smooth scrolling on
      if (Math.abs(target - pos) < 0.5) driving = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return; // pinch zoom
      if (e.deltaY === 0) return; // horizontal gestures stay native
      // let inner scrollers (if any) scroll themselves
      let el = e.target instanceof Element ? e.target : null;
      while (el && el !== document.body && el !== document.documentElement) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return;
        el = el.parentElement;
      }
      e.preventDefault();
      if (!driving) pos = target = window.scrollY;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const lead = window.innerHeight * MAX_LEAD;
      target = clamp(target + e.deltaY * unit, Math.max(0, pos - lead), Math.min(maxY(), pos + lead));
      driving = true;
    };

    // a menu jump or other programmatic scroll takes over from any wheel motion in progress
    const stop = () => {
      driving = false;
      pos = target = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
      gsap.ticker.remove(tick);
    };
  }, []);

  return null;
}
