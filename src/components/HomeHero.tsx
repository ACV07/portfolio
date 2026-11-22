"use client";

import { useCallback, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import ParticlePortrait from "./ParticlePortrait";
import { scrollToAbout } from "@/lib/scroll";

// Row styles, top to bottom. "dir" sets marquee direction.
const ROWS = [
  { cls: "outline-text [--stroke:#1f1f1f]", dir: -1 },
  { cls: "outline-text [--stroke:#2c2c2c]", dir: 1 },
  { cls: "text-ink", dir: -1 },
  { cls: "text-dim", dir: 1 },
  { cls: "text-ink", dir: -1 },
  { cls: "outline-text [--stroke:#2c2c2c]", dir: 1 },
  { cls: "outline-text [--stroke:#1f1f1f]", dir: -1 },
];

// The "</>" code symbol between the names. Drawn as strokes so it also works on the outlined rows.
const CodeMark = () => (
  <svg viewBox="0 0 32 24" className="mx-[0.3em] h-[0.55em] w-[0.75em] flex-none" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 5 2 12l7 7M23 5l7 7-7 7M19 2l-6 20" />
  </svg>
);

/**
 * The name screen: particle portrait in front of the moving name wall.
 * It is rendered as the top layer of the About section, so scrolling splits the
 * name rows apart (see AboutReveal) to reveal the About sky behind them.
 */
export default function HomeHero() {
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const name = site.name.toUpperCase();
  const segment = (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className="inline-flex items-center">
          {name}
          <CodeMark />
        </span>
      ))}
    </>
  );

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
      gsap.set(rows, { autoAlpha: 0 });
      // keep the portrait centred (xPercent) so the pointer drift (x) never overrides it
      gsap.set("[data-figure]", { xPercent: -50 });

      // Endless marquee, alternating directions (runs hidden until the portrait is ready)
      const loops = reduce
        ? []
        : rows.map((row) => {
            const dir = Number(row.dataset.dir);
            return gsap.fromTo(
              row,
              { xPercent: dir < 0 ? 0 : -50 },
              { xPercent: dir < 0 ? -50 : 0, duration: 70 + Math.random() * 30, ease: "none", repeat: -1 }
            );
          });

      // Plays the moment the portrait has finished building:
      // the name rows softly fade and sharpen into view while gliding behind the portrait,
      // starting a little quicker and settling smoothly into their normal speed.
      intro.current = gsap
        .timeline({ paused: true })
        .fromTo(
          rows,
          { autoAlpha: 0, filter: "blur(14px)", scale: 1.06 },
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1.8,
            ease: "power2.out",
            stagger: { each: 0.12, from: "center" },
            clearProps: "filter,scale",
          }
        )
        .fromTo("[data-scroll-cue]", { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, 1.4)
        .to("[data-scroll-cue] svg", { y: 5, duration: 0.7, repeat: -1, yoyo: true, ease: "sine.inOut" }, 2.2);
      loops.forEach((loop) => {
        intro.current?.fromTo(loop, { timeScale: 6 }, { timeScale: 1, duration: 3.5, ease: "sine.out" }, 0);
      });

      if (!site.portrait) intro.current.play();
      if (reduce) return;

      // Wall and portrait drift with the pointer (depth)
      const move = (e: PointerEvent) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        gsap.to("[data-wall]", { x: x * -30, y: y * -16, duration: 1.2, ease: "power3.out" });
        gsap.to("[data-figure]", { x: x * 14, duration: 1.2, ease: "power3.out" });
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root }
  );

  const onPortraitReady = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) intro.current?.progress(1);
    else intro.current?.play();
  }, []);

  return (
    <div ref={root} data-hero className="absolute inset-0 z-[6] overflow-hidden">
      <h1 className="sr-only">
        {site.name} — {site.role}
      </h1>

      {/* Solid backdrop that fades away to reveal the About sky behind */}
      <div data-hero-bg aria-hidden="true" className="absolute inset-0 bg-bg" />

      <div
        data-wall
        aria-hidden="true"
        className="display pointer-events-none absolute -inset-x-10 inset-y-0 flex flex-col justify-center whitespace-nowrap pt-16 text-[clamp(64px,10.5vw,152px)] leading-[0.9]"
      >
        {ROWS.map((r, i) => (
          <div key={i} data-row-wrap className="overflow-x-clip">
            <div data-row data-dir={r.dir} className={`invisible flex w-max ${r.cls}`}>
              <span className="flex">{segment}</span>
              <span className="flex">{segment}</span>
            </div>
          </div>
        ))}
      </div>

      {site.portrait ? (
        <div
          data-figure
          className="absolute bottom-0 left-1/2 z-10 aspect-[1086/1448] h-[68svh] sm:h-[80svh] lg:h-[88svh]"
        >
          <ParticlePortrait
            src={site.portrait}
            alt={`Portrait of ${site.name}`}
            className="h-full w-full"
            onReady={onPortraitReady}
          />
        </div>
      ) : null}

      <a
        href="#about"
        data-scroll-cue
        onClick={(e) => {
          e.preventDefault();
          scrollToAbout();
        }}
        className="label invisible absolute inset-x-0 bottom-6 z-20 mx-auto flex w-max items-center gap-2.5 text-mute transition-colors hover:text-ink"
      >
        Scroll
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </a>

      {/* Floor: blends the portrait and the name wall evenly into the page at the bottom */}
      <div
        data-floor
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[22%] bg-[linear-gradient(to_top,var(--color-bg)_8%,rgba(10,10,10,.85)_40%,transparent)]"
      />
    </div>
  );
}
