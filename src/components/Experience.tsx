"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { scrollToSection } from "@/lib/scroll";

const yearOf = (s: string) => s.match(/\d{4}/)?.[0] ?? s;

/**
 * Experience as a horizontal timeline. The section pins, and scrolling down
 * moves the track sideways through each year, oldest to newest.
 *
 * If an `intro` layer is passed ("Origin & foundations"), it shows first: its step
 * lines join into one line that slides down to become this timeline's line.
 */
export default function Experience({ intro }: { intro?: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const items = [...site.experience].reverse(); // oldest first
  // Re-measure once the display font has loaded and when the width changes,
  // otherwise the scroll distance is computed from fallback-font widths.
  const [ver, setVer] = useState(0);
  useEffect(() => {
    let w = window.innerWidth;
    let t: ReturnType<typeof setTimeout>;
    document.fonts?.ready.then(() => setVer((v) => v + 1));
    const onResize = () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(() => setVer((v) => v + 1), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useGSAP(
    () => {
      const el = track.current;
      const section = root.current;
      if (!el || !section) return;
      const q = gsap.utils.selector(section);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
      const vh = window.innerHeight;
      const P0 = intro ? 1 : 0; // length of the line handoff, in screen heights
      const moveDur = Math.max(0.5, distance() / vh);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "experience-reveal",
          trigger: section,
          start: "top top",
          end: () => "+=" + (window.innerHeight * P0 + distance()),
          pin: true,
          scrub: reduce ? true : 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      if (intro) {
        // Phase 0: the line handoff
        const firstStep = q("[data-step-line]")[0] as HTMLElement | undefined;
        const fromY = () => (firstStep ? firstStep.getBoundingClientRect().top - section.getBoundingClientRect().top : vh * 0.4);
        const line = q("[data-handoff]");
        gsap.set(el, { autoAlpha: 0, x: 160 });
        gsap.set(q("[data-x-grid]"), { autoAlpha: 0 });

        tl.fromTo(line, { top: fromY, scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.3, ease: "power2.inOut" }, 0)
          .set(q("[data-step-line]"), { autoAlpha: 0 }, 0.3)
          .to(q("[data-origin-part]"), { x: -140, autoAlpha: 0, duration: 0.3, stagger: 0.03, ease: "power2.in" }, 0.2)
          .fromTo(line, { top: fromY }, { top: () => section.clientHeight * 0.5, duration: 0.35, ease: "power2.inOut", immediateRender: false }, 0.35)
          .to(q("[data-x-grid]"), { autoAlpha: 1, duration: 0.3 }, 0.5)
          .to(el, { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out" }, 0.55)
          .fromTo(q("[data-x-title] span"), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 0.3, stagger: 0.015, ease: "power3.out" }, 0.6)
          .fromTo(q("[data-x-intro]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.05 }, 0.7)
          .to(line, { autoAlpha: 0, duration: 0.15 }, 0.85)
          .set(q("[data-origin]"), { autoAlpha: 0 }, P0);
      } else {
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .from("[data-x-title] span", { yPercent: 110, y: 0, duration: 1, stagger: 0.04 })
          .from("[data-x-intro]", { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.1 }, 0.4);
      }
      tl.addLabel("experience", P0);

      // Phase 1: sideways scroll through the years
      tl.to(el, { x: () => -distance(), duration: moveDur }, P0).fromTo(
        q("[data-x-progress]"),
        { scaleX: 0 },
        { scaleX: 1, duration: moveDur },
        P0
      );

      // Each stop lights up as it reaches the middle of the screen
      const dist = Math.max(1, distance());
      const clamp = gsap.utils.clamp(0, 1);
      q("[data-stop]").forEach((stop: HTMLElement) => {
        const a = clamp((stop.offsetLeft - window.innerWidth * 0.75) / dist);
        const b = Math.max(a + 0.02, clamp((stop.offsetLeft - window.innerWidth * 0.35) / dist));
        // Stops already on screen when the timeline appears light up during the handoff
        const visibleAtStart = a === 0 && intro;
        const at = visibleAtStart ? P0 - 0.3 : P0 + a * moveDur;
        const dur = visibleAtStart ? 0.25 : (b - a) * moveDur;
        if (reduce) return;
        tl.fromTo(stop.querySelector("[data-year]"), { autoAlpha: 0.15, y: 40 }, { autoAlpha: 1, y: 0, duration: dur, ease: "power2.out" }, at)
          .fromTo(stop.querySelector("[data-dot]"), { scale: 0.4, backgroundColor: "#0a0a0a" }, { scale: 1, backgroundColor: "#ffffff", duration: dur }, at)
          .fromTo(stop.querySelector("[data-card]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: dur, ease: "power2.out" }, at + dur * 0.15);
      });

      // A rebuild creates this trigger after the later sections' ones; put them back in page order
      if (ver > 0) {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }

      // Arriving from another page via "Experience"
      if (window.location.hash === "#experience") requestAnimationFrame(() => scrollToSection("experience", false));
    },
    { scope: root, dependencies: [ver], revertOnUpdate: true }
  );

  return (
    <section ref={root} id="experience" aria-labelledby="experience-title" className="relative h-svh overflow-hidden bg-deep">
      {intro}
      {intro ? (
        <div data-handoff aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-[6] h-[1.5px] origin-left bg-white" />
      ) : null}

      {/* faint grid */}
      <div
        data-x-grid
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(#141414_1px,transparent_1px),linear-gradient(90deg,#141414_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div ref={track} className="relative flex h-full w-max items-stretch">
        {/* the timeline line runs the full length of the track */}
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-[#2f2f2f]" />

        {/* intro panel: title sits above the line, the scroll cue below it */}
        <div className="relative h-full w-[88vw] flex-none px-[max(4vw,16px)] sm:w-[min(62vw,1000px)]">
          <div className="absolute inset-x-[max(4vw,16px)] bottom-[calc(50%+24px)]">
            <h1
              id="experience-title"
              data-x-title
              aria-label="Experience"
              className="display mt-3 overflow-hidden text-[clamp(56px,9vw,140px)] leading-[0.9]"
            >
              {"Experience".split("").map((ch, i) => (
                <span key={i} aria-hidden="true" className="inline-block">
                  {ch}
                </span>
              ))}
            </h1>
          </div>
          <span data-x-intro className="label absolute left-[max(4vw,16px)] top-[calc(50%+28px)] inline-flex items-center gap-3 text-mute">
            Scroll
            <svg width="28" height="14" viewBox="0 0 28 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 7h25M20 1l6 6-6 6" />
            </svg>
          </span>
        </div>

        {/* one stop per role */}
        <ol className="flex h-full">
          {items.map((x, i) => {
            const isActive = x.status === "active";
            const label = isActive ? "Now" : yearOf(x.from);
            return (
              <li
                key={i}
                data-stop
                className="relative flex h-full w-[min(560px,86vw)] flex-none flex-col px-[max(3vw,16px)]"
              >
                <div className="flex h-1/2 items-end pb-6">
                  <span
                    data-year
                    className={`display block text-[clamp(96px,15vw,220px)] leading-[0.8] ${
                      isActive ? "outline-text [--stroke:#ffffff]" : "text-ink"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                <span
                  data-dot
                  aria-hidden="true"
                  className="absolute top-1/2 -mt-[7px] h-[15px] w-[15px] rounded-full border-2 border-white bg-white"
                />

                <div data-card className="mt-8 max-w-[440px] border-l border-white pl-5">
                  <span className="label text-mute">
                    {x.from} — {x.to}
                  </span>
                  <h2 className="display mt-2 text-[clamp(26px,2.6vw,38px)] leading-[1.02]">{x.role}</h2>
                  <p className="label mt-2 text-soft">{x.org}</p>
                  {x.notes ? <p className="mt-3 text-[15px] leading-relaxed text-soft">{x.notes}</p> : null}
                  <span
                    className={`label mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${
                      isActive ? "bg-white text-black" : "border border-white/40 text-soft"
                    }`}
                  >
                    {isActive ? (
                      <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-50" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
                      </span>
                    ) : null}
                    {isActive ? "Current role" : "Completed"}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {/* breathing room after the last stop */}
        <div className="w-[max(8vw,40px)] flex-none" aria-hidden="true" />
      </div>

      {/* progress */}
      <div className="absolute inset-x-[max(4vw,16px)] bottom-8 h-[2px] bg-[#2a2a2a]" aria-hidden="true">
        <div data-x-progress className="h-[2px] origin-left bg-white" />
      </div>
    </section>
  );
}
