"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import SwirlSky from "./SwirlSky";
import Skyline from "./Skyline";
import LocalTime from "./LocalTime";
import { ArrowDown } from "./Icons";
import { scrollToAbout } from "@/lib/scroll";

/**
 * About opening: a swirling night sky with an "ABOUT ME" card.
 * If an `intro` layer (the name screen) is passed, it sits on top first:
 * scrolling splits its name rows apart, alternating left and right, to reveal the sky.
 * Then the card grows to full screen, the title splits off both sides,
 * a spotlight switches on and the story comes in.
 */
export default function AboutReveal({ intro }: { intro?: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const [skyPaused, setSkyPaused] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-curtain]"), { xPercent: -50, yPercent: -50 });
      gsap.set(q("[data-beam], [data-pool]"), { autoAlpha: 0 });
      gsap.set(q("[data-story]"), { autoAlpha: 0, y: 30 });

      const hasIntro = !!intro;
      const P = hasIntro ? 1.2 : 0; // length of the name-wall split phase

      if (hasIntro) {
        gsap.set(q("[data-curtain]"), { autoAlpha: 0, y: 80 });
        gsap.set(q("[data-title] span"), { autoAlpha: 0, yPercent: 110 });
        gsap.set(q("[data-hint-in]"), { autoAlpha: 0 });
      } else {
        gsap
          .timeline({
            defaults: { ease: "power4.out" },
            scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
          })
          .from(q("[data-curtain]"), { y: 80, autoAlpha: 0, duration: 1.2 })
          .from(q("[data-title] span"), { yPercent: 110, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.25)
          .from(q("[data-hint-in]"), { autoAlpha: 0, duration: 0.6 }, 0.8);
      }

      const total = P + 1.6;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "about-reveal",
          trigger: root.current,
          start: "top top",
          end: hasIntro ? "+=420%" : "+=260%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const t = self.progress * total;
            setSkyPaused((hasIntro && t < 0.03) || t > P + 0.9);
          },
        },
      });

      // Phase 0: the name wall splits open
      if (hasIntro) {
        const wraps = q("[data-row-wrap]");
        tl.to(q("[data-scroll-cue]"), { autoAlpha: 0, duration: 0.1 }, 0)
          .to(
            wraps,
            {
              x: (i: number) => (i % 2 ? 1 : -1) * (window.innerWidth + 120),
              ease: "power3.inOut",
              duration: 0.8,
              stagger: { each: 0.035, from: "center" },
            },
            0.05
          )
          .to(q("[data-figure]"), { autoAlpha: 0, y: -60, scale: 0.92, ease: "power2.in", duration: 0.55 }, 0.1)
          .to(q("[data-floor]"), { autoAlpha: 0, duration: 0.4 }, 0.1)
          .to(q("[data-hero-bg]"), { autoAlpha: 0, duration: 0.7 }, 0.15)
          .to(q("[data-curtain]"), { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.5 }, 0.55)
          .to(q("[data-title] span"), { autoAlpha: 1, yPercent: 0, ease: "power3.out", duration: 0.45, stagger: 0.08 }, 0.65)
          .to(q("[data-hint-in]"), { autoAlpha: 1, duration: 0.2 }, 0.95)
          .set(q("[data-hero]"), { autoAlpha: 0 }, P);
      }
      tl.addLabel("about", P);

      // Phase 1: the About reveal
      tl.to(q("[data-hint]"), { autoAlpha: 0, duration: 0.1 }, P)
        .to(q("[data-curtain]"), { width: "100%", height: "100%", borderWidth: 0, ease: "power2.inOut", duration: 1 }, P)
        .to(q("[data-sky]"), { autoAlpha: 0, duration: 1 }, P)
        .to(q("[data-t-a]"), { x: () => -window.innerWidth * 0.65, ease: "power2.in", duration: 0.8 }, P + 0.35)
        .to(q("[data-t-m]"), { x: () => window.innerWidth * 0.65, ease: "power2.in", duration: 0.8 }, P + 0.35)
        .to(q("[data-title]"), { autoAlpha: 0, duration: 0.25 }, P + 0.9)
        .to(q("[data-beam], [data-pool]"), { autoAlpha: 1, duration: 0.6 }, P + 0.85)
        .to(q("[data-story]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, P + 1.1);

      // Arriving from another page via "About me"
      if (window.location.hash === "#about") requestAnimationFrame(() => scrollToAbout(false));

      ScrollTrigger.refresh();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="about" aria-label="About me" className="relative h-svh overflow-hidden bg-deep">
      {intro}

      <div data-sky className="absolute inset-0">
        <SwirlSky paused={skyPaused} />
        <Skyline />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_50%_52%,rgba(0,0,0,.55),transparent_70%)]" />
      </div>

      {/* spotlight */}
      <div
        data-beam
        aria-hidden="true"
        className="pointer-events-none absolute left-[58%] top-[-25%] z-[2] h-[150%] w-[clamp(160px,22vw,320px)] origin-top rotate-[30deg] bg-[linear-gradient(to_bottom,rgba(255,255,255,.75),rgba(255,255,255,.2)_55%,transparent_85%)] blur-[34px]"
      />
      <div
        data-pool
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[74%] z-[2] h-[90px] w-[min(440px,80vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,255,255,.3),transparent_70%)] blur-[10px]"
      />

      {/* the card that becomes the stage */}
      <div
        data-curtain
        className="absolute left-1/2 top-1/2 z-[1] h-[min(470px,58svh)] w-[min(340px,70vw)] overflow-hidden border border-[#3a3a3a] bg-[linear-gradient(165deg,#2b2b2b,#0c0c0c_45%,#000)] shadow-[0_40px_120px_rgba(0,0,0,.9)]"
      >
        <div className="absolute left-[45%] top-[-20%] h-[160%] w-[35%] origin-top rotate-[32deg] bg-[linear-gradient(to_bottom,rgba(255,255,255,.5),transparent_75%)] blur-[22px]" />
      </div>

      {/* story */}
      <div className="absolute inset-0 z-[3] grid grid-cols-1 grid-rows-[auto_auto_1fr_auto_auto] gap-4 px-[max(4vw,16px)] pb-7 pt-40 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto] lg:gap-6 xl:pt-28">
        <div
          data-story
          aria-hidden="true"
          className="display outline-text pointer-events-none absolute bottom-[6%] left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[clamp(120px,23vw,330px)] leading-none [--stroke:#1e1e1e] sm:block"
        >
          About me
        </div>

        <div data-story className="max-w-[640px] lg:col-span-2">
          <h2 className="display whitespace-pre-line text-balance text-[28px] leading-[1.04] sm:text-[clamp(32px,3.8vw,52px)]">
            {site.aboutHeadline}
          </h2>
        </div>

        <div data-story className="flex flex-wrap gap-4 lg:col-start-3 lg:flex-col lg:items-end lg:gap-1.5 lg:text-right">
          <LocalTime className="label text-mute" />
        </div>

        <div data-story className="flex max-w-[540px] flex-col gap-3.5 lg:col-start-1 lg:row-start-3">
          <span className="label text-mute">Focus areas</span>
          <ul className="flex flex-wrap gap-2">
            {site.skills.map((s) => (
              <li key={s} className="rounded-full border border-[#3a3a3a] px-3.5 py-2 text-[13px] uppercase tracking-[0.08em]">
                {s}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5 text-[14px] leading-relaxed text-soft sm:text-[15px]">
            {site.aboutBio.map((para, i) =>
              i === site.aboutBio.length - 1 ? (
                <p key={i} className="font-bold text-ink">
                  {para}
                </p>
              ) : (
                <p key={i}>{para}</p>
              )
            )}
          </div>
        </div>

      </div>

      {/* title */}
      <h1
        data-title
        className="display pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center overflow-hidden text-[min(112px,22vw,14svh)] leading-[0.9] [text-shadow:0_10px_40px_rgba(0,0,0,.8)]"
      >
        <span data-t-a className="block">About</span>
        <span data-t-m className="block">Me</span>
      </h1>

      <div data-hint className="absolute inset-x-0 bottom-7 z-[4]">
        <div data-hint-in className="label flex items-center justify-center gap-2.5">
          Scroll to enter <ArrowDown />
        </div>
      </div>
    </section>
  );
}
