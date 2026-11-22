"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { scrollToSection } from "@/lib/scroll";
import { ArrowUpRight } from "./Icons";

/** Issuer mark: the official logo file if one is set, else the issuer name as a monochrome wordmark. */
function IssuerMark({ issuer, logo, big }: { issuer: string; logo: string | null; big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/[0.04] ${
        big ? "h-16 min-w-16 px-4" : "h-12 min-w-12 px-3"
      }`}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={issuer} className={`${big ? "h-7" : "h-5"} w-auto brightness-0 invert`} />
      ) : (
        <span className={`font-bold uppercase tracking-[0.18em] ${big ? "text-[15px]" : "text-[12px]"}`}>{issuer}</span>
      )}
    </span>
  );
}

/**
  * (Previous design, kept as a backup.) Certifications in priority order. The top two are large cards, the rest sit below.
 * Cards rise in with a light sweep; hovering replays the sweep. Each links to its credential.
 */
export default function CertificationsCards() {
  const root = useRef<HTMLElement>(null);
  const certs = site.certifications;

  useGSAP(
    () => {
      if (window.location.hash === "#certifications") requestAnimationFrame(() => scrollToSection("certifications", false));
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap
        .timeline({
          scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
          defaults: { ease: "power3.out" },
        })
        .from("[data-c-title] span", { yPercent: 110, duration: 0.9, stagger: 0.03 })
        .from("[data-cert]", { autoAlpha: 0, y: 60, rotationX: -25, transformOrigin: "50% 100%", duration: 0.9, stagger: 0.1 }, 0.25)
        .fromTo("[data-sheen]", { xPercent: -120 }, { xPercent: 220, duration: 1.1, stagger: 0.1, ease: "power2.inOut" }, 0.7);
    },
    { scope: root }
  );

  const sweep = (el: HTMLElement) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el.querySelector("[data-sheen]"), { xPercent: -120 }, { xPercent: 220, duration: 0.9, ease: "power2.inOut" });
  };

  return (
    <section
      ref={root}
      id="certifications"
      aria-labelledby="certifications-title"
      className="relative overflow-hidden bg-deep px-[max(4vw,16px)] pb-28 pt-28 [perspective:1200px]"
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h2
          id="certifications-title"
          data-c-title
          aria-label="Certifications"
          className="display overflow-hidden text-[clamp(44px,8vw,128px)] leading-[0.9]"
        >
          {"Certifications".split("").map((ch, i) => (
            <span key={i} aria-hidden="true" className="inline-block">
              {ch}
            </span>
          ))}
        </h2>
      </div>

      <ol className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {certs.map((c, i) => {
          const big = i < 2;
          return (
            <li key={c.url} data-cert className={big ? "md:col-span-3" : "md:col-span-2"}>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={(e) => sweep(e.currentTarget)}
                onFocus={(e) => sweep(e.currentTarget)}
                aria-label={`${c.title}, ${c.issuer}. Verify credential (opens in a new tab)`}
                className={`group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-2xl border bg-[#0b0b0b] p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-white/60 sm:p-7 ${
                  big ? "min-h-[300px] border-white/30" : "min-h-[240px] border-[#2a2a2a]"
                }`}
              >
                {/* light sweep */}
                <span
                  data-sheen
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[120%] skew-x-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)]"
                />
                {/* big faint rank */}
                <span
                  aria-hidden="true"
                  className={`display outline-text pointer-events-none absolute -bottom-6 right-3 leading-none [--stroke:#1f1f1f] ${
                    big ? "text-[180px]" : "text-[130px]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative flex items-start justify-between gap-4">
                  <IssuerMark issuer={c.issuer} logo={c.logo} big={big} />
                  <span className="label text-mute">Priority {String(i + 1).padStart(2, "0")}</span>
                </div>

                <div className="relative">
                  <h3 className={`display leading-[1.02] ${big ? "text-[clamp(34px,3.6vw,54px)]" : "text-[clamp(24px,2.2vw,32px)]"}`}>
                    {c.title}
                  </h3>
                  <span className="label mt-5 inline-flex items-center gap-2 border-b border-white/40 pb-1 transition-colors group-hover:border-white">
                    Verify credential <ArrowUpRight />
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
