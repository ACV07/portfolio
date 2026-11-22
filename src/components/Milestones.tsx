"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { scrollToSection } from "@/lib/scroll";

const ordinal = (n: number) => ["", "st", "nd", "rd"][n] ?? "th";

// A fixed barcode pattern per pass, so it doesn't change between renders
const barcode = (seed: string) =>
  Array.from(
    { length: 34 },
    (_, i) => ((seed.charCodeAt(i % seed.length) * (i + 7)) % 4) + 1,
  );

/**
 * Milestones as hackathon lanyard passes.
 * Transition from Skills: as this section scrolls in, the lit skill-level bars fly
 * down and stretch into the lanyard straps. When they land, the passes drop onto
 * them and swing to rest, placings get a stamp, and they keep a gentle sway.
 */
export default function Milestones({ outro, finale }: { outro?: ReactNode; finale?: ReactNode }) {
  const [ver, setVer] = useState(0);
  useEffect(() => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    let t: ReturnType<typeof setTimeout>;
    document.fonts?.ready.then(() => setVer((v) => v + 1));
    const onResize = () => {
      if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 120) return;
      w = window.innerWidth;
      h = window.innerHeight;
      clearTimeout(t);
      t = setTimeout(() => setVer((v) => v + 1), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const all = site.milestones;

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      if (window.location.hash === "#milestones")
        requestAnimationFrame(() => scrollToSection("milestones", false));
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const q = gsap.utils.selector(section);
      const passes = q("[data-pass]") as HTMLElement[];
      const bodies = q("[data-pass-body]") as HTMLElement[];
      const straps = q("[data-strap]") as HTMLElement[];
      const flyers = gsap.utils.toArray<HTMLElement>("[data-flyer]");
      if (reduce) return;

      gsap.from("[data-m-title] span", {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.035,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 70%", once: true },
      });

      // Passes wait, hidden, for their straps
      gsap.set(straps, { autoAlpha: 0 });
      gsap.set(bodies, { autoAlpha: 0 });
      let sway: gsap.core.Tween[] = [];
      const drop = gsap
        .timeline({
          paused: true,
          onComplete: () => {
            sway = passes.map((p, i) =>
              gsap.fromTo(
                p,
                { rotation: -1.6 + (i % 2) * 0.8 },
                {
                  rotation: 1.6 - (i % 2) * 0.8,
                  duration: 2.6 + i * 0.4,
                  ease: "sine.inOut",
                  repeat: -1,
                  yoyo: true,
                },
              ),
            );
          },
        })
        .fromTo(
          bodies,
          {
            autoAlpha: 0,
            y: -160,
            rotation: (i: number) => (i % 2 ? 16 : -16),
          },
          {
            autoAlpha: 1,
            y: 0,
            rotation: 0,
            duration: 1.5,
            stagger: 0.12,
            ease: "elastic.out(1, 0.45)",
          },
        )
        .fromTo(
          q("[data-stamp]"),
          { scale: 2.6, autoAlpha: 0, rotation: -40 },
          {
            scale: 1,
            autoAlpha: 1,
            rotation: -12,
            duration: 0.45,
            ease: "back.out(2.2)",
          },
          1.05,
        );
      let dropped = false;
      const reset = () => {
        sway.forEach((t) => t.kill());
        sway = [];
        gsap.set(passes, { rotation: 0 });
        drop.pause(0);
        dropped = false;
      };

      const clamp = gsap.utils.clamp(0, 1);
      const ease = gsap.parseEase("power2.inOut");
      const mix = (a: number, b: number, t: number) => a + (b - a) * t;
      const DARK = [46, 46, 46];

      // The bars-to-straps flight
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => {
          const p = self.progress;
          const sources = gsap.utils
            .toArray<HTMLElement>("#skills [data-lit]")
            .slice(0, straps.length);
          // the bars on the Skills page stay where they are: only copies of them fly
          sources.forEach((src) => (src.style.visibility = ""));

          straps.forEach((strap, i) => {
            const fly = flyers[i];
            const src = sources[i];
            if (!fly) return;
            const t = clamp((p - i * 0.07) / 0.7);
            const e = ease(t);
            const landed = t >= 1;
            gsap.set(strap, { autoAlpha: landed ? 1 : 0 });
            if (!src || p <= 0.001 || landed) {
              fly.style.visibility = "hidden";
              return;
            }
            const s = src.getBoundingClientRect();
            const d = strap.getBoundingClientRect();
            const win = strap.dataset.win === "1";
            const c = win
              ? [255, 255, 255]
              : [255, 255, 255].map((v, k) => Math.round(mix(v, DARK[k], e)));
            // The bar swells into a glowing pill, swings out along an arc and leaves a light trail
            const arc = Math.sin(Math.PI * e);
            const bow = (i - (straps.length - 1) / 2) * 46 * arc;
            const w = mix(s.width, d.width, e) * (1 + 0.9 * arc);
            const h = mix(s.height, d.height, e) + 10 * arc;
            const cx = mix(s.left + s.width / 2, d.left + d.width / 2, e) + bow;
            const cy = mix(s.top + s.height / 2, d.top + d.height / 2, e);
            Object.assign(fly.style, {
              visibility: "visible",
              left: `${cx - w / 2}px`,
              top: `${cy - h / 2}px`,
              width: `${w}px`,
              height: `${h}px`,
              background: `rgb(${c.join(",")})`,
              borderRadius: `${mix(3, 1, e)}px`,
              boxShadow: win
                ? "none"
                : `0 ${-70 * arc}px ${22 * arc}px ${-6 * arc}px rgba(255,255,255,${0.55 * arc}), 0 0 ${26 * arc}px rgba(255,255,255,${0.7 * arc})`,
            });
          });

          if (p >= 0.92 && !dropped) {
            dropped = true;
            drop.play(0);
          } else if (p < 0.5 && dropped) {
            reset();
          }
        },
      });
    },
    { scope: root },
  );

  // Transition to Certifications: once the last pass is in view, the page pins and
  // the certifications panel slides in from the right.
  useGSAP(
    () => {
      const box = wrap.current;
      if (!box || !outro) return;
      const panel = box.querySelector<HTMLElement>("[data-cert-panel]");
      if (!panel) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scroller0 = panel.querySelector<HTMLElement>("[data-cert-scroll]");
      const cpanel = finale ? box.querySelector<HTMLElement>("[data-contact-panel]") : null;
      gsap.set(panel, { xPercent: 100, autoAlpha: 0, y: 0 });
      if (scroller0) gsap.set(scroller0, { y: 0 });
      if (cpanel) gsap.set(cpanel, { y: window.innerHeight, autoAlpha: 0 });
      let certShown = false;
      let contactShown = false;
      // Panels taller than the screen keep scrolling through their content
      const vh = window.innerHeight;
      const head = panel.querySelector<HTMLElement>("[data-cert-head]");
      const grid = panel.querySelector<HTMLElement>("[data-cert-grid]");
      const scroller = panel.querySelector<HTMLElement>("[data-cert-scroll]");
      const need = head && grid ? head.getBoundingClientRect().height + grid.getBoundingClientRect().height + 40 : vh;
      const extra = 0; // certifications always fit one screen: no second scroll
      void need;
      const extra2 = cpanel ? Math.max(0, cpanel.offsetHeight - vh) : 0;
      const T1 = 1.15 + extra / vh; // certifications fully read
      const T2 = T1 + 0.2; // contact starts rising
      const total = cpanel ? T2 + 1 + 0.15 + extra2 / vh : 1.15 + extra / vh;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "milestones-reveal",
          trigger: box,
          start: "bottom bottom",
          end: () => "+=" + window.innerHeight * total,
          pin: true,
          scrub: reduce ? true : 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Replay each panel's entrance whenever it arrives; reset it when it leaves
            const at = self.progress * total;
            if (at >= 0.85 && !certShown) {
              certShown = true;
              window.dispatchEvent(new Event("certs:enter"));
            } else if (at < 0.4 && certShown) {
              certShown = false;
              window.dispatchEvent(new Event("certs:leave"));
            }
            if (cpanel) {
              if (at >= T2 + 0.08 && !contactShown) {
                contactShown = true;
                window.dispatchEvent(new Event("contact:enter"));
              } else if (at < T2 + 0.02 && contactShown) {
                contactShown = false;
                window.dispatchEvent(new Event("contact:leave"));
              }
            }
          },
        },
      });
      tl.set(panel, { autoAlpha: 1 }, 0)
        .to(panel, { xPercent: 0, duration: 1, ease: "power2.inOut" }, 0)
        .addLabel("certifications", 1.15);
      if (extra > 0 && scroller) tl.to(scroller, { y: -extra, duration: extra / vh }, 1.15);
      if (cpanel) {
        // Certifications slide up and away while contact rises from the bottom
        tl.set(cpanel, { autoAlpha: 1 }, T2)
          .to(panel, { y: -vh, duration: 1, ease: "power2.inOut" }, T2)
          .to(cpanel, { y: 0, duration: 1, ease: "power2.inOut" }, T2)
          .addLabel("contact", T2 + 1.15);
        if (extra2 > 0) tl.to(cpanel, { y: -extra2, duration: extra2 / vh }, T2 + 1.15);
        tl.to({}, { duration: 0.15 }, total - 0.15);
      } else {
        tl.to({}, { duration: 0.15 }, 1);
      }
      if (ver > 0) {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }
      if (window.location.hash === "#certifications") requestAnimationFrame(() => scrollToSection("certifications", false));
      if (window.location.hash === "#contact") requestAnimationFrame(() => scrollToSection("contact", false));
    },
    { scope: wrap, dependencies: [ver], revertOnUpdate: true },
  );

  return (
    <div ref={wrap} className="relative overflow-hidden">
    <section
      ref={root}
      id="milestones"
      aria-labelledby="milestones-title"
      className="relative overflow-hidden bg-deep px-[max(4vw,16px)] pb-28 pt-32"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
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
      </div>

      {/* the rail the lanyards hang from */}
      <div aria-hidden="true" className="h-px w-full bg-[#2a2a2a]" />

      <ol className="grid grid-cols-1 gap-x-6 gap-y-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {all.map((m, i) => {
          const win = m.rank > 0;
          return (
            <li
              key={m.event}
              data-pass
              className="group relative flex origin-top flex-col items-center"
            >
              {/* strap */}
              <span
                data-strap
                data-win={win ? "1" : "0"}
                aria-hidden="true"
                className={`block h-16 w-4 sm:h-24 ${
                  win
                    ? "bg-[repeating-linear-gradient(180deg,#fff_0_6px,#bdbdbd_6px_12px)]"
                    : "bg-[repeating-linear-gradient(180deg,#2e2e2e_0_6px,#1f1f1f_6px_12px)]"
                }`}
              />
              <div data-pass-body className="flex w-full flex-col items-center">
                {/* clip */}
                <span
                  aria-hidden="true"
                  className="-mt-1 block h-4 w-8 rounded-b-md border-2 border-t-0 border-[#777] bg-[#111]"
                />

                <article
                  className={`relative -mt-1 flex w-full max-w-[300px] flex-col overflow-hidden rounded-2xl border bg-[#0e0e0e] p-5 transition-transform duration-500 group-hover:-translate-y-2 ${
                    win
                      ? "border-white shadow-[0_0_60px_rgba(255,255,255,.08)]"
                      : "border-[#333]"
                  }`}
                >
                  {/* punch hole */}
                  <span
                    aria-hidden="true"
                    className="mx-auto mb-4 block h-2.5 w-12 rounded-full bg-deep ring-1 ring-[#333]"
                  />

                  <div className="flex items-center justify-between">
                    <span className="label text-[11px] text-mute">
                      Hacker pass
                    </span>
                    <span className="label text-[11px] text-mute">
                      #{String(i + 1).padStart(3, "0")}
                    </span>
                  </div>

                  <h3 className="display mt-4 min-h-[3.2em] text-[clamp(22px,1.9vw,28px)] leading-[1.05]">
                    {m.event}
                  </h3>

                  <div className="mt-5 border-t border-[#2a2a2a] pt-4">
                    <span className="label block text-[11px] text-mute">
                      Holder
                    </span>
                    <span className="display mt-1 block text-lg">
                      {site.name}
                    </span>
                  </div>

                  {/* barcode */}
                  <div
                    aria-hidden="true"
                    className="mt-4 flex h-9 items-stretch gap-[2px] opacity-70"
                  >
                    {barcode(m.event).map((w, k) => (
                      <span
                        key={k}
                        className="block bg-[#bdbdbd]"
                        style={{ width: w }}
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`label ${win ? "text-ink" : "text-soft"}`}>
                      {m.result}
                    </span>
                    <span className="label text-[11px] text-mute">
                      {win ? "Podium" : "Admit one"}
                    </span>
                  </div>

                  {win ? (
                    <span
                      data-stamp
                      aria-hidden="true"
                      className="display pointer-events-none absolute right-4 top-[53%] -rotate-12 rounded-md border-[3px] border-white px-3 py-1 text-center text-[30px] leading-none text-white mix-blend-screen"
                    >
                      {m.rank}
                      {ordinal(m.rank)}
                      <span className="block text-[11px] tracking-[0.2em]">
                        Place
                      </span>
                    </span>
                  ) : null}
                </article>
              </div>
            </li>
          );
        })}
      </ol>

      {/* the skill bars in flight (positioned on screen while scrolling in from Skills) */}
      {all.map((m) => (
        <span
          key={m.event}
          data-flyer
          aria-hidden="true"
          className="pointer-events-none invisible fixed left-0 top-0 z-[45] block"
        />
      ))}
    </section>
      {outro ? (
        <div data-cert-panel className="absolute inset-x-0 top-[calc(100%-100svh)] z-10 h-svh overflow-hidden border-l border-white/40 bg-deep">
          {outro}
        </div>
      ) : null}
      {finale ? (
        <div data-contact-panel className="absolute inset-x-0 top-[calc(100%-100svh)] z-20 min-h-svh border-t border-white/50 bg-deep">
          {finale}
        </div>
      ) : null}
    </div>
  );
}
