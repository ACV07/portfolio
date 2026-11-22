"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { scrollToSection } from "@/lib/scroll";

const ordinal = (n: number) => ["", "st", "nd", "rd"][n] ?? "th";

/** (Previous design, kept as a backup.) Competitions and hackathons. Placings get a featured card; the rest are listed beside it. */
export default function MilestonesFeatured() {
  const root = useRef<HTMLElement>(null);
  const all = site.milestones;
  const featured = all.filter((m) => m.rank > 0);
  const rest = all.filter((m) => m.rank === 0);

  useGSAP(
    () => {
      if (window.location.hash === "#milestones") requestAnimationFrame(() => scrollToSection("milestones", false));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
          defaults: { ease: "power3.out" },
        })
        .from("[data-m-title] span", { yPercent: 110, duration: 0.9, stagger: 0.035 })
        .from("[data-m-feature]", { autoAlpha: 0, y: 50, duration: 0.9 }, 0.2)
        .from("[data-m-rank]", { yPercent: 100, duration: 1.1, ease: "power4.out" }, 0.4)
        .from("[data-m-glow]", { autoAlpha: 0, scale: 0.6, duration: 1.2 }, 0.5)
        .from("[data-m-line]", { scaleX: 0, transformOrigin: "left", duration: 0.7, stagger: 0.12, ease: "power2.inOut" }, 0.5)
        .from("[data-m-row]", { autoAlpha: 0, x: 24, duration: 0.6, stagger: 0.12 }, 0.65);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="milestones"
      aria-labelledby="milestones-title"
      className="relative overflow-hidden bg-deep px-[max(4vw,16px)] pb-28 pt-32"
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <h2
          id="milestones-title"
          data-m-title
          aria-label="Milestones"
          className="display overflow-hidden text-[clamp(52px,9vw,140px)] leading-[0.9]"
        >
          {"Milestones".split("").map((ch, i) => (
            <span key={i} aria-hidden="true" className="inline-block">
              {ch}
            </span>
          ))}
        </h2>
        <span className="label text-mute">
          {String(all.length).padStart(2, "0")} competitions · {String(featured.length).padStart(2, "0")} podium
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
        {featured.map((m) => (
          <article
            key={m.event}
            data-m-feature
            className="relative flex min-h-[360px] flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-white/50 bg-black p-6 sm:p-8"
          >
            <div
              data-m-glow
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.18),transparent_65%)]"
            />
            <div className="flex items-center justify-between">
              <span className="label inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-black">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
                </svg>
                {m.result}
              </span>
              <span className="label text-mute">International</span>
            </div>

            <div className="overflow-hidden" aria-hidden="true">
              <div data-m-rank className="display flex items-start pb-2 leading-[0.86]">
                <span className="text-[clamp(130px,14vw,210px)]">{String(m.rank).padStart(2, "0")}</span>
                <span className="outline-text mt-3 text-[clamp(40px,5vw,72px)] [--stroke:#ffffff]">{ordinal(m.rank)}</span>
              </div>
            </div>

            <h3 className="display max-w-[22ch] text-[clamp(24px,2.4vw,34px)] leading-[1.05]">{m.event}</h3>
          </article>
        ))}

        <ol className="flex flex-col justify-center">
          {rest.map((m, i) => (
            <li key={m.event} data-m-row className="relative py-6">
              <span data-m-line aria-hidden="true" className="absolute inset-x-0 top-0 block h-px bg-[#3a3a3a]" />
              <div className="flex items-start gap-5">
                <span className="label pt-1.5 text-mute">{String(i + featured.length + 1).padStart(2, "0")}</span>
                <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-3">
                  <h3 className="display text-[clamp(22px,2.3vw,32px)] leading-[1.05]">{m.event}</h3>
                  <span className="label rounded-full border border-white/40 px-3 py-1.5 text-soft">{m.result}</span>
                </div>
              </div>
            </li>
          ))}
          <li aria-hidden="true" className="relative">
            <span data-m-line className="absolute inset-x-0 top-0 block h-px bg-[#3a3a3a]" />
          </li>
        </ol>
      </div>
    </section>
  );
}
