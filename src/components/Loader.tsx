"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { ScrollTrigger } from "@/lib/gsap";

const MIN_MS = 3000; // shortest time the loader stays up
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Opening screen: the ACV logo comes out of a blur while a glowing ring fills around it
 * and a ribbon of fine wave lines shimmers inside. When it finishes it fades away and the
 * name page starts (the portrait waits for the "loader:done" event).
 */
export default function Loader() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null);
  const logo = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const canvas = cv.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      root.style.overflow = "";
      const id = window.setTimeout(() => setGone(true), 0);
      return () => window.clearTimeout(id);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.dataset.loading = "1";
    root.style.overflow = "hidden";

    let W = 0;
    const size = () => {
      W = canvas.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.height = Math.round(W * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    if (!loaded) window.addEventListener("load", onLoad);

    const t0 = performance.now();
    const minMs = reduce ? 900 : MIN_MS;
    let p = 0;
    let raf = 0;
    let finishing = false;
    let timer = 0;

    const finish = () => {
      if (finishing) return;
      finishing = true;
      setLeaving(true);
      root.dataset.loading = "0";
      window.dispatchEvent(new Event("loader:done"));
      timer = window.setTimeout(() => {
        root.style.overflow = "";
        delete root.dataset.loading;
        setGone(true);
        ScrollTrigger.refresh();
      }, 900);
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const t = (now - t0) / 1000;
      const elapsed = now - t0;
      // time-driven fill that waits (at 92%) for the page to finish loading
      const timeP = Math.min(1, elapsed / minMs);
      const target = loaded ? timeP : Math.min(timeP, 0.92);
      p += (target - p) * 0.12;
      if (target >= 1 && p > 0.995) p = 1;

      const c = W / 2;
      const R = W * 0.38;
      ctx.clearRect(0, 0, W, W);
      const pe = ease(p);

      // the logo comes out of a blur
      if (logo.current) {
        logo.current.style.filter = `blur(${((1 - pe) * 22).toFixed(1)}px) brightness(1.25)`;
        logo.current.style.opacity = String(0.12 + 0.88 * pe);
      }

      // wave rings: layered sine-modulated circles that flow around the logo
      const wave = (j: number, a1: number, alpha: number, width: number, glow: number) => {
        const amp = (7 + j * 4.5) * (reduce ? 0.6 : 1);
        const n = 3 + j;
        const sp = (reduce ? 0 : t) * (1.1 + j * 0.35) * (j % 2 ? -1 : 1);
        const a0 = -Math.PI / 2;
        const steps = Math.max(2, Math.ceil(240 * Math.min(1, (a1 - a0) / (Math.PI * 2) + 0.01)));
        ctx.beginPath();
        let ex = 0;
        let ey = 0;
        for (let i = 0; i <= steps; i++) {
          const th = a0 + ((a1 - a0) * i) / steps;
          const r = R + amp * Math.sin(n * th + sp);
          ex = c + Math.cos(th) * r;
          ey = c + Math.sin(th) * r;
          if (i === 0) ctx.moveTo(ex, ey);
          else ctx.lineTo(ex, ey);
        }
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = width;
        ctx.lineJoin = "round";
        ctx.save();
        ctx.shadowColor = "rgba(255,255,255,0.85)";
        ctx.shadowBlur = glow;
        ctx.stroke();
        ctx.restore();
        return [ex, ey];
      };

      // faint full track of the same waves
      for (let j = 0; j < 5; j++) wave(j, -Math.PI / 2 + Math.PI * 2, 0.07, 0.7, 0);

      // progress: the waves fill around clockwise, the first one brightest
      if (p > 0.002) {
        const a1 = -Math.PI / 2 + Math.PI * 2 * p;
        for (let j = 4; j >= 1; j--) wave(j, a1, 0.16 + (4 - j) * 0.08, 0.9, 0);
        const [hx, hy] = wave(0, a1, 0.98, 2.4, 14);
        ctx.save();
        ctx.shadowColor = "rgba(255,255,255,0.95)";
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(hx, hy, 3.8, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(draw);

    // finish a beat after the fill completes
    const poll = window.setInterval(() => {
      if (p >= 0.995 && performance.now() - t0 >= minMs && loaded) {
        window.clearInterval(poll);
        window.setTimeout(finish, 350);
      }
    }, 100);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(poll);
      window.clearTimeout(timer);
      window.removeEventListener("resize", size);
      window.removeEventListener("load", onLoad);
      root.style.overflow = "";
    };
  }, []);

  if (gone) return null;
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-700 ease-out ${leaving ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className={`relative aspect-square w-[min(78vmin,460px)] transition-transform duration-700 ease-out ${leaving ? "scale-105" : ""}`}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logo}
          src={site.logo}
          alt=""
          aria-hidden="true"
          style={{ filter: "blur(22px) brightness(1.25)", opacity: 0.12 }}
          className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
}
