"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { scrollToSection } from "@/lib/scroll";
import { ArrowUpRight } from "./Icons";

type Cert = (typeof site.certifications)[number];

/** One round seal: a spinning text ring around a disc with the certificate. Links to the credential. */
function Seal({ cert, index, featured }: { cert: Cert; index: number; featured: boolean }) {
  const id = `seal-path-${index}`;
  const ring = `${cert.issuer} · Certified · ${cert.issuer} · Certified · `.toUpperCase();
  return (
    <a
      href={cert.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${cert.title}, ${cert.issuer}. Verify credential (opens in a new tab)`}
      className="group flex flex-col items-center gap-4 text-center outline-none"
    >
      <span
        data-seal
        className={`relative block aspect-square [container-type:inline-size] ${featured
            ? "w-[min(420px,82vw,max(110px,calc((var(--av,1000px)-140px)/2.333)))] lg:w-[min(420px,40vw,max(150px,calc(var(--av,1000px)-40px)))]"
            : "w-[min(230px,40vw,max(70px,calc((var(--av,1000px)-140px)/3.5)))] lg:w-[min(230px,20vw,max(90px,calc((var(--av,1000px)-96px)/2)))]"}`}
      >
        {/* spinning ring */}
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full ${index % 2 ? "animate-[spin_26s_linear_infinite_reverse]" : "animate-[spin_22s_linear_infinite]"} motion-reduce:animate-none group-hover:[animation-duration:6s]`}
        >
          <defs>
            <path id={id} d="M50,50 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" />
          </defs>
          <circle cx="50" cy="50" r="48.5" fill="none" stroke={featured ? "#fff" : "#444"} strokeWidth="0.6" />
          <circle cx="50" cy="50" r="34" fill="none" stroke={featured ? "#fff" : "#333"} strokeWidth="0.4" strokeDasharray="1 1.6" />
          <text fontSize={featured ? 6.2 : 7} fontWeight={700} fill={featured ? "#fff" : "#9a9a9a"}>
            <textPath href={`#${id}`} textLength="256" lengthAdjust="spacing">
              {ring}
            </textPath>
          </text>
        </svg>

        {/* disc */}
        <span
          data-disc
          className={`absolute inset-[19%] flex flex-col items-center justify-center rounded-full px-[9%] transition-transform duration-500 group-hover:scale-[1.05] group-focus-visible:scale-[1.05] ${
            featured ? "bg-white text-black" : "border border-[#2e2e2e] bg-[#0e0e0e] text-ink group-hover:border-white/50"
          }`}
        >
          <span className={`font-bold uppercase tracking-[0.2em] ${featured ? "text-[3.1cqw]" : "text-[4.3cqw] text-mute"}`}>
            {cert.issuer}
          </span>
          <span
            className={`display mt-[2cqw] text-balance leading-[1] ${
              featured ? "text-[12.4cqw]" : "text-[8.7cqw]"
            }`}
          >
            {cert.title}
          </span>
          <span className={`label mt-[3cqw] ${featured ? "text-[2.9cqw]" : "text-[4.3cqw] text-mute"}`}>
            No. {String(index + 1).padStart(2, "0")}
          </span>
        </span>
      </span>

      <span className="label inline-flex items-center gap-2 border-b border-white/30 pb-1 text-soft transition-colors group-hover:border-white group-hover:text-ink group-focus-visible:border-white">
        Verify <ArrowUpRight />
      </span>
    </a>
  );
}

/**
 * Certifications as round seals in priority order. The top certificate is a large white
 * seal; the rest sit beside it. Rings spin slowly (faster on hover); seals stamp in on scroll.
 */
export default function Certifications({ embedded = false }: { embedded?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [first, ...rest] = site.certifications;

  useGSAP(
    () => {
      if (!embedded && window.location.hash === "#certifications") requestAnimationFrame(() => scrollToSection("certifications", false));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const intro = gsap
        .timeline({
          paused: embedded,
          scrollTrigger: embedded ? undefined : { trigger: root.current, start: "top 65%", once: true },
          defaults: { ease: "power3.out" },
        })
        .from("[data-c-title] span", { yPercent: 110, duration: 0.9, stagger: 0.03 })
        .from("[data-seal]", { scale: 1.8, autoAlpha: 0, rotation: -30, duration: 0.6, stagger: 0.12, ease: "back.out(1.6)" }, 0.35);
      // Embedded in Milestones: play once the panel is mostly on screen
      if (embedded) {
        const play = () => intro.play(0);
        const reset = () => intro.pause(0);
        window.addEventListener("certs:enter", play);
        window.addEventListener("certs:leave", reset);
        return () => {
          window.removeEventListener("certs:enter", play);
          window.removeEventListener("certs:leave", reset);
        };
      }
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="certifications"
      aria-labelledby="certifications-title"
      className={`relative overflow-hidden bg-deep px-[max(4vw,16px)] ${embedded ? "flex h-svh flex-col [--av:calc(100svh-235px)] lg:[--av:calc(100svh-max(72px,10svh)-11svh-52px)]" : "pb-28 pt-28"}`}
    >
      {/* the title stays put; only the seals scroll beneath it */}
      <div
        data-cert-head
        className={embedded ? "relative z-10 -mx-[max(4vw,16px)] bg-deep px-[max(4vw,16px)] pb-5 pt-24 sm:pt-28 lg:pt-[max(72px,10svh)]" : "mb-12"}
      >
        <div className={`flex flex-wrap items-end justify-between gap-4 ${embedded ? "max-sm:[zoom:0.75]" : ""}`}>
          <h2
            id="certifications-title"
            data-c-title
            aria-label="Certifications"
            className={`display overflow-hidden leading-[0.9] ${embedded ? "text-[clamp(44px,8vw,128px)] lg:text-[min(8vw,128px,12svh)]" : "text-[clamp(44px,8vw,128px)]"}`}
          >
            {"Certifications".split("").map((ch, i) => (
              <span key={i} aria-hidden="true" className="inline-block">
                {ch}
              </span>
            ))}
          </h2>
        </div>
      </div>

      <div data-cert-scroll className={embedded ? "flex flex-1 flex-col pb-8" : undefined}>
        <div
          data-cert-grid
          className={`grid grid-cols-1 items-center gap-6 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] ${embedded ? "my-auto" : ""}`}
        >
          <div className="flex justify-center">
            <Seal cert={first} index={0} featured />
          </div>
          <ol className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6">
            {rest.map((c, i) => (
              <li key={c.url}>
                <Seal cert={c} index={i + 1} featured={false} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
