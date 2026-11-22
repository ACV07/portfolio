"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { ArrowUpRight } from "./Icons";

/** Contact: a huge outlined word with the email and a grid of links laid over it. */
export default function Contact({ embedded = false }: { embedded?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const intro = gsap
        .timeline({ paused: embedded, defaults: { ease: "power4.out" } })
        .from("[data-c-word] span", { yPercent: 105, duration: 1.1, stagger: 0.05 })
        .from("[data-c-in]", { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.06 }, embedded ? 0.1 : 0.5);
      // Embedded in the home page: play each time the panel arrives
      if (embedded) {
        const play = () => intro.play(0);
        const reset = () => intro.pause(0);
        window.addEventListener("contact:enter", play);
        window.addEventListener("contact:leave", reset);
        return () => {
          window.removeEventListener("contact:enter", play);
          window.removeEventListener("contact:leave", reset);
        };
      }
    },
    { scope: root }
  );

  const draft = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(site.email)}&su=${encodeURIComponent("Hello Adrian")}&body=${encodeURIComponent("Hi Adrian,\n\n")}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the mailto link still works */
    }
  };

  return (
    <section
      ref={root}
      id="contact"
      aria-labelledby="contact-title"
      className="relative flex min-h-svh [&_*]:normal-case flex-col justify-center overflow-hidden bg-deep px-[max(4vw,16px)] pb-10 pt-28 sm:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(#141414_1px,transparent_1px),linear-gradient(90deg,#141414_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div className="relative mx-auto w-full max-w-[1400px]">
        {/* the huge outlined word */}
        <h1
          id="contact-title"
          data-c-word
          aria-label="Let's talk"
          className="display outline-text overflow-hidden whitespace-nowrap text-[min(clamp(44px,16vw,300px),28svh)] leading-[1.05] [--stroke:#6a6a6a]"
        >
          {"LET'S TALK".split("").map((ch, i) => (
            <span key={i} aria-hidden="true" className="inline-block">
              {ch === " " ? "\u00a0" : ch}
            </span>
          ))}
        </h1>

        {/* sits over the bottom of the word */}
        <div className="relative -mt-[min(2svh,16px)] sm:-mt-[min(3svh,28px)]">
          <p data-c-in className="display !uppercase text-[clamp(30px,5vw,72px)] leading-none">
            WRITE TO ME
          </p>
          <div data-c-in className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href={`mailto:${site.email}`}
              className="break-all text-[clamp(15px,1.7vw,24px)] font-medium underline decoration-white/30 decoration-2 underline-offset-[6px] transition hover:decoration-white"
            >
              {site.email}
            </a>
            <a
              href={draft}
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-black transition hover:bg-white/80"
            >
              Draft a mail <ArrowUpRight size={12} />
            </a>
            <button
              type="button"
              onClick={copy}
              className="label inline-flex w-fit items-center rounded-full border border-white/40 px-4 py-2 text-soft transition hover:bg-white hover:text-black"
            >
              <span aria-live="polite">{copied ? "Copied ✓" : "Copy email"}</span>
            </button>
          </div>

          <ul data-c-in className="mt-8 grid grid-cols-1 border border-white/30 sm:mt-10 sm:grid-cols-2">
            {site.socials.map((s, i) => (
              <li
                key={s.label}
                className={`border-white/30 ${i < 2 ? "border-b" : ""} ${i === 2 ? "max-sm:border-b" : ""} ${i === 0 || i === 2 ? "sm:border-r" : ""} max-sm:border-b max-sm:last:border-b-0`}
              >
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-white hover:text-black sm:py-7"
                >
                  <span>
                    <span className="display block text-[clamp(24px,3vw,44px)] leading-none">{s.label}</span>
                    <span className="label mt-2 block text-mute group-hover:text-black/60">{s.handle}</span>
                  </span>
                  <ArrowUpRight size={22} className="flex-none transition group-hover:rotate-45" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
