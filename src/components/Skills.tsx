"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";

const LEVELS = ["Beginner", "Foundational", "Intermediate"];

/**
 * Skills in three groups. Skills with a level get a 3-step meter.
 * With `embedded`, it renders as the final layer of the Projects section, which
 * drives its animation (three columns rise, see Projects); it is scaled to fit one screen.
 */
export default function Skills({ embedded = false }: { embedded?: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (embedded) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const st = { trigger: root.current, start: "top 70%", once: true };
      gsap
        .timeline({ scrollTrigger: st, defaults: { ease: "power3.out" } })
        .from("[data-s-title] span", {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.04,
        })
        .from(
          "[data-s-group]",
          { autoAlpha: 0, y: 40, duration: 0.8, stagger: 0.12 },
          0.2,
        )
        .from(
          "[data-s-row]",
          { autoAlpha: 0, x: -16, duration: 0.5, stagger: 0.05 },
          0.45,
        )
        .from(
          "[data-s-seg]",
          {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.out",
          },
          0.7,
        );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="skills"
      aria-labelledby="skills-title"
      className={
        embedded
          ? "absolute inset-0 overflow-hidden bg-deep"
          : "relative overflow-hidden bg-deep px-[max(4vw,16px)] pb-28 pt-28 sm:pt-32"
      }
    >
      <div
        data-s-fit
        className={
          embedded
            ? "origin-top-left px-[max(4vw,16px)] pb-10 pt-36 xl:pt-28"
            : ""
        }
      >
        <div
          aria-hidden="true"
          className="display outline-text pointer-events-none absolute -right-6 top-16 select-none text-[clamp(120px,22vw,320px)] leading-none [--stroke:#161616]"
        >
          Skills
        </div>

        <h2
          id="skills-title"
          data-s-title
          aria-label="Skills"
          className="display relative mb-8 overflow-hidden md:mb-14 text-[clamp(56px,9vw,140px)] leading-[0.9]"
        >
          {"Skills".split("").map((ch, i) => (
            <span key={i} aria-hidden="true" className="inline-block">
              {ch}
            </span>
          ))}
        </h2>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 lg:gap-12">
          {site.skillGroups.map((g) => (
            <div key={g.title} data-s-group className="flex flex-col">
              <div className="mb-5 flex items-baseline justify-between border-b border-white pb-3">
                <h3 className="display text-[clamp(22px,2vw,30px)] leading-none">
                  {g.title}
                </h3>
              </div>
              <ul className="flex flex-col">
                {g.items.map((s) => {
                  const lvl = LEVELS.indexOf(s.level) + 1;
                  return (
                    <li
                      key={s.name}
                      data-s-row
                      className="flex items-center justify-between gap-4 border-b border-line py-3 md:py-4"
                    >
                      <span className="min-w-0 text-[17px] font-medium">{s.name}</span>
                      {lvl > 0 ? (
                        <span className="flex flex-none items-center gap-3">
                          <span className="label text-[11px] text-mute md:max-lg:hidden">
                            {s.level}
                          </span>
                          <span
                            className="flex flex-none gap-1"
                            role="img"
                            aria-label={`${s.level}: ${lvl} of 3`}
                          >
                            {[1, 2, 3].map((k) => (
                              <span
                                key={k}
                                data-s-seg
                                data-lit={k <= lvl ? "" : undefined}
                                className={`h-2 w-5 flex-none rounded-[2px] ${k <= lvl ? "bg-white" : "bg-[#262626]"}`}
                              />
                            ))}
                          </span>
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
