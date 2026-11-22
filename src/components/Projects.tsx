"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { scrollToSection } from "@/lib/scroll";
import { ArrowUpRight } from "./Icons";

const STEP = 34; // degrees between cards on the wheel

/**
 * Projects as a 3D scrolling wheel: the section pins and scrolling turns a drum of
 * project images (like a rolodex). Names sit in a list on the left; the one in
 * front of the wheel is highlighted with its details.
 *
 * If an `outro` is passed (Skills), it is the final layer: after the last project,
 * three columns rise from the bottom one after another and reveal it.
 */
export default function Projects({ outro }: { outro?: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const items = site.projects;
  const n = items.length;

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const cards = q("[data-pcard]") as HTMLElement[];
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const place = (pos: number) => {
        const wheel = section.querySelector("[data-wheel]") as HTMLElement;
        const w = Math.min(wheel.clientWidth, wheel.clientHeight * 0.62 * (16 / 9));
        const h = w * (9 / 16);
        const radius = h / 2 / Math.tan(((STEP / 2) * Math.PI) / 180) + 24;
        cards.forEach((card, i) => {
          const angle = (i - pos) * STEP;
          const far = Math.min(1, Math.abs(angle) / 90);
          gsap.set(card, {
            width: w,
            height: h,
            marginTop: -h / 2,
            marginLeft: -w / 2,
            transform: `rotateX(${-angle}deg) translateZ(${radius}px)`,
            autoAlpha: Math.abs(angle) > 95 ? 0 : 1,
            filter: `brightness(${1 - far * 0.75})`,
            zIndex: 100 - Math.round(Math.abs(angle)),
          });
        });
        gsap.set(q("[data-drum]"), { transform: `translateZ(${-radius}px)` });
      };

      const state = { pos: 0 };
      place(0);

      // Fit the Skills layer into one screen
      const fit = () => {
        const layer = section.querySelector("[data-s-fit]") as HTMLElement | null;
        if (!layer) return;
        gsap.set(layer, { scale: 1, width: "100%" });
        const k = Math.min(1, section.clientHeight / layer.scrollHeight);
        gsap.set(layer, { scale: k, width: `${100 / k}%` });
      };
      fit();

      const OUT = outro ? 1.6 : 0; // length of the rising-columns phase, in wheel steps
      const cols = { a: 100, b: 100, c: 100 };
      const clip = () => {
        const el = section.querySelector("[data-outro]") as HTMLElement | null;
        if (!el) return;
        el.style.clipPath = `polygon(0% ${cols.a}%, 33.34% ${cols.a}%, 33.34% ${cols.b}%, 66.67% ${cols.b}%, 66.67% ${cols.c}%, 100% ${cols.c}%, 100% 100%, 0% 100%)`;
        q("[data-edge]").forEach((e: HTMLElement, i: number) => {
          const v = [cols.a, cols.b, cols.c][i];
          e.style.top = `${v}%`;
          e.style.opacity = v > 0.5 && v < 99.5 ? "1" : "0";
        });
      };
      clip();

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "projects-reveal",
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 0.9 * (n - 1 + OUT),
          pin: true,
          scrub: reduce ? true : 0.6,
          snap: reduce ? undefined : { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, ease: "power2.inOut" },
          invalidateOnRefresh: true,
          onRefresh: () => {
            place(state.pos);
            fit();
          },
        },
      });
      for (let i = 0; i < n; i++) tl.addLabel(`p${i}`, i);
      tl.addLabel("projects", 0).to(state, {
        pos: n - 1,
        ease: "none",
        duration: n - 1,
        onUpdate: () => {
          place(state.pos);
          setActive(Math.round(state.pos));
        },
      });
      if (outro) {
        tl.to(cols, { a: 0, duration: 0.8, ease: "power2.inOut", onUpdate: clip }, n - 1)
          .to(cols, { b: 0, duration: 0.8, ease: "power2.inOut", onUpdate: clip }, n - 1 + 0.25)
          .to(cols, { c: 0, duration: 0.8, ease: "power2.inOut", onUpdate: clip }, n - 1 + 0.5)
          .fromTo(q("[data-s-title] span"), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 0.4, stagger: 0.03, ease: "power3.out" }, n - 1 + 0.9)
          .fromTo(q("[data-s-seg]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "left", duration: 0.3, stagger: 0.03, ease: "power2.out" }, n - 1 + 1.15)
          .addLabel("skills", n - 1 + OUT);
      }
      st.current = tl.scrollTrigger ?? null;

      // Intro as the section arrives
      gsap.from(q("[data-p-intro]"), {
        autoAlpha: 0,
        y: 24,
        stagger: 0.06,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });

      if (window.location.hash === "#projects") requestAnimationFrame(() => scrollToSection("projects", false));
      if (window.location.hash === "#skills") requestAnimationFrame(() => scrollToSection("skills", false));
    },
    { scope: root }
  );

  // Click a name to turn the wheel to it
  const goTo = (i: number) => {
    const t = st.current;
    if (!t) return;
    const tl = t.animation as gsap.core.Timeline;
    window.scrollTo({ top: t.start + ((t.end - t.start) * i) / tl.duration(), behavior: "smooth" });
  };

  const cur = items[active];

  return (
    <section ref={root} id="projects" aria-labelledby="projects-title" className="relative h-svh overflow-hidden bg-deep">
      <div className="grid h-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-4 px-[max(4vw,16px)] pb-6 pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:grid-rows-1 lg:gap-12 lg:pb-10 xl:pt-28">
        {/* the wheel */}
        <div data-wheel data-p-intro className="relative min-h-0 overflow-hidden lg:order-2 [perspective:1400px]">
          <div data-drum className="absolute inset-0 [transform-style:preserve-3d]">
            {items.map((p, i) => (
              <a
                key={p.name}
                data-pcard
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                tabIndex={i === active ? 0 : -1}
                aria-label={`${p.name} on GitHub`}
                className="absolute left-1/2 top-1/2 block overflow-hidden rounded-2xl border border-white/15 bg-[#111] [backface-visibility:hidden]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt="" loading={i < 2 ? "eager" : "lazy"} className="h-full w-full object-cover" />
                <span className="label absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-[11px] backdrop-blur">
                  {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
              </a>
            ))}
          </div>
          {/* fade the top and bottom of the wheel */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[200] h-[18%] bg-[linear-gradient(var(--color-deep),transparent)]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[200] h-[18%] bg-[linear-gradient(transparent,var(--color-deep))]" />
        </div>

        {/* names (left on desktop, below the wheel on phones) */}
        <div className="relative z-10 flex min-h-0 flex-col justify-center lg:order-1">
          <div data-p-intro className="mb-4 flex items-baseline justify-between gap-4 lg:mb-6">
            <h2 id="projects-title" className="display text-[min(clamp(56px,9vw,140px),15svh)] leading-[0.9]">
              Projects
            </h2>
            <span className="label whitespace-nowrap text-mute">
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>

          <ol data-p-intro className="hidden flex-col border-t border-line lg:flex">
            {items.map((p, i) => {
              const on = i === active;
              return (
                <li key={p.name} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={on ? "true" : undefined}
                    className={`group flex w-full items-center gap-4 py-3 text-left transition-colors ${on ? "text-ink" : "text-dim hover:text-soft"}`}
                  >
                    <span className="label w-7 flex-none">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`display flex-1 leading-[1.05] transition-all duration-500 ${on ? "text-[clamp(24px,2.4vw,34px)]" : "text-[clamp(17px,1.5vw,21px)]"}`}>
                      {p.name}
                    </span>
                    <span className={`h-px bg-white transition-all duration-500 ${on ? "w-10" : "w-0"}`} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>

          {/* details of the project in front */}
          <div key={active} className="mt-5 animate-[fadeUp_.5s_ease-out] lg:mt-6">
            <h3 className="display text-[26px] leading-none lg:hidden">{cur.name}</h3>
            <p className="mt-2 max-w-[48ch] text-[14px] leading-relaxed text-soft sm:text-[15px] lg:mt-0">{cur.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {cur.tags.map((t) => (
                <span key={t} className="rounded-full border border-[#3a3a3a] px-3 py-1.5 text-[12px] uppercase tracking-[0.08em]">
                  {t}
                </span>
              ))}
              <a
                href={cur.repo}
                target="_blank"
                rel="noreferrer"
                className="label ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-black transition-transform hover:scale-[1.03]"
              >
                GitHub <ArrowUpRight />
              </a>
            </div>
          </div>
        </div>
      </div>

      {outro ? (
        <>
          <div data-outro className="absolute inset-0 z-[40]" style={{ clipPath: "inset(100% 0 0 0)" }}>
            {outro}
          </div>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              data-edge
              aria-hidden="true"
              className="pointer-events-none absolute z-[41] h-[2px] bg-white opacity-0"
              style={{ left: `${i * 33.34}%`, width: "33.34%", top: "100%" }}
            />
          ))}
        </>
      ) : null}
    </section>
  );
}
