"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";

/**
 * (Previous design, kept as a backup.) Experience as security "case files": one ticket per role, newest first.
 * Active roles get a live pulse; cards scan in as you scroll.
 */
export default function ExperienceCases() {
  const root = useRef<HTMLElement>(null);
  const cases = site.experience;
  const active = cases.filter((c) => c.status === "active").length;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from("[data-x-label]", { autoAlpha: 0, y: 12, duration: 0.6 })
        .from("[data-x-title] span", { yPercent: 110, duration: 1, stagger: 0.04 }, 0.1)
        .from("[data-x-stat]", { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1 }, 0.5);

      gsap.utils.toArray<HTMLElement>("[data-case]").forEach((card) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
          defaults: { ease: "power3.out" },
        });
        tl.from(card, { autoAlpha: 0, y: 50, duration: 0.8 })
          .fromTo(card.querySelector("[data-scanline]"), { xPercent: -100, autoAlpha: 1 }, { xPercent: 100, duration: 0.9, ease: "power2.inOut" }, 0.15)
          .set(card.querySelector("[data-scanline]"), { autoAlpha: 0 })
          .from(card.querySelectorAll("[data-case-part]"), { autoAlpha: 0, y: 10, duration: 0.5, stagger: 0.07 }, 0.35);
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-labelledby="experience-title"
      className="relative min-h-svh overflow-hidden bg-deep px-[max(4vw,16px)] pb-24 pt-40 xl:pt-36"
    >
      {/* faint grid, like a monitoring screen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(#141414_1px,transparent_1px),linear-gradient(90deg,#141414_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_75%)]"
      />

      <header className="relative mb-12 flex flex-wrap items-end justify-between gap-8">
        <div>
          <span data-x-label className="label text-mute">
            Case files
          </span>
          <h1
            id="experience-title"
            data-x-title
            className="display mt-2 overflow-hidden text-[clamp(56px,10vw,150px)] leading-[0.9]"
            aria-label="Experience"
          >
            {"Experience".split("").map((ch, i) => (
              <span key={i} aria-hidden="true" className="inline-block">
                {ch}
              </span>
            ))}
          </h1>
        </div>

        <dl className="flex gap-10">
          <div data-x-stat>
            <dt className="label text-mute">Cases</dt>
            <dd className="display m-0 text-5xl">{String(cases.length).padStart(2, "0")}</dd>
          </div>
          <div data-x-stat>
            <dt className="label text-mute">Active</dt>
            <dd className="display m-0 flex items-center gap-3 text-5xl">
              {String(active).padStart(2, "0")}
              {active ? (
                <span className="relative flex h-3 w-3" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      </header>

      <ol className="relative flex flex-col gap-4">
        {cases.map((c, i) => {
          const id = String(cases.length - i).padStart(3, "0");
          const isActive = c.status === "active";
          return (
            <li
              key={id}
              data-case
              className={`group relative overflow-hidden rounded-xl border bg-black/60 p-5 transition-colors sm:p-7 ${
                isActive ? "border-white/60" : "border-line hover:border-white/40"
              }`}
            >
              <span
                data-scanline
                aria-hidden="true"
                className="pointer-events-none invisible absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.08)_45%,rgba(255,255,255,.35)_50%,transparent_52%)]"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-center md:gap-8">
                <div data-case-part className="flex flex-row gap-4 md:flex-col md:gap-1">
                  <span className="label text-mute">Case #{id}</span>
                  <span className="label whitespace-nowrap">
                    {c.from} — {c.to}
                  </span>
                </div>

                <div data-case-part>
                  <h2 className="display m-0 text-[clamp(26px,3.2vw,44px)] leading-[1.02]">{c.role}</h2>
                  <p className="label mt-2 text-soft">{c.org}</p>
                  {c.notes ? <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-soft">{c.notes}</p> : null}
                </div>

                <div data-case-part className="md:justify-self-end">
                  {isActive ? (
                    <span className="label inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-black">
                      <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-50" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
                      </span>
                      Active
                    </span>
                  ) : (
                    <span className="label inline-flex rounded-full border border-white/40 px-3.5 py-2 text-soft">Completed</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
