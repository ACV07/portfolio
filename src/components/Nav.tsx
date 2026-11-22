"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { nav, site } from "@/data/site";
import { scrollToSection, sectionY, type Section } from "@/lib/scroll";

const HOME_SECTIONS = ["/", "/about", "/experience", "/projects", "/skills", "/milestones", "/certifications", "/contact"];
const sectionOf = (href: string) => (href.startsWith("/#") ? (href.slice(2) as Section) : null);

/** The ACV logo. */
function Monogram() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={site.logo} alt="" aria-hidden="true" className="h-7 w-auto xl:h-9" />
  );
}

/**
 * Top menu in the reference style: monogram, a divider, then serif capitals between
 * fine top and bottom rules, separated by slashes. A white underline marks the section
 * in view and slides along as you scroll. Always visible; on narrow screens the strip
 * can be swiped sideways and keeps the current section in view.
 */
export default function Nav() {
  const path = usePathname();
  const onHome = HOME_SECTIONS.includes(path);
  const [spy, setSpy] = useState("/");
  const active = onHome ? spy : path;
  const bar = useRef<HTMLUListElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  // Scroll spy: which home section is in view
  useEffect(() => {
    if (!onHome) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = "/";
      for (const item of nav) {
        const s = sectionOf(item.href);
        if (!s) continue;
        const y = sectionY(s);
        if (y !== null && window.scrollY + window.innerHeight * 0.35 >= y) current = item.href;
      }
      setSpy(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const first = setTimeout(update, 400);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(first);
      cancelAnimationFrame(raf);
    };
  }, [onHome]);

  // Slide the underline to the active link
  const moveLine = useCallback(
    (instant = false) => {
      const ul = bar.current;
      const el = ul?.querySelector<HTMLElement>(`[data-href="${active}"]`);
      if (!ul || !el || !line.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const strip = ul.parentElement;
      if (strip && strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({
          left: el.offsetLeft - strip.clientWidth / 2 + el.offsetWidth / 2,
          behavior: instant || reduce ? "auto" : "smooth",
        });
      }
      gsap.to(line.current, {
        x: el.offsetLeft,
        width: el.offsetWidth,
        duration: instant || reduce ? 0 : 0.55,
        ease: "power3.out",
      });
    },
    [active]
  );
  useLayoutEffect(() => moveLine(), [moveLine]);
  useEffect(() => {
    const ro = new ResizeObserver(() => moveLine(true));
    if (bar.current) ro.observe(bar.current);
    document.fonts?.ready.then(() => moveLine(true));
    return () => ro.disconnect();
  }, [moveLine]);

  const go = (e: React.MouseEvent, href: string) => {
    const s = sectionOf(href);
    if (onHome && (s || href === "/")) {
      e.preventDefault();
      if (s) scrollToSection(s);
      else scrollToSection("top");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[linear-gradient(to_bottom,rgba(5,5,5,.94),rgba(5,5,5,.7)_70%,transparent)] px-[max(3vw,12px)] pb-2 pt-2.5 xl:pt-4">
      <div className="flex items-center gap-3 sm:gap-5 xl:gap-7">
        <Link href="/" onClick={(e) => go(e, "/")} aria-label="Adrian Cherian, home" className="flex-none">
          <Monogram />
        </Link>
        <span aria-hidden="true" className="h-8 w-px flex-none bg-white/40 xl:h-10" />

        <nav aria-label="Main" className="min-w-0 flex-1">
          {/* the rules frame the strip; on narrow screens the strip scrolls sideways */}
          <div className="no-scrollbar overflow-x-auto border-y border-white/35 [mask-image:linear-gradient(90deg,#000_92%,transparent)] lg:[mask-image:none]">
            <ul
              ref={bar}
              className="relative flex w-max min-w-full items-center justify-between px-2 font-[family-name:var(--font-serif)] xl:px-3"
            >
              {nav.flatMap((item, i) => {
                const on = item.href === active;
                const link = (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-href={item.href}
                      onClick={(e) => go(e, item.href)}
                      aria-current={on ? "page" : undefined}
                      className={`block whitespace-nowrap px-1.5 py-2.5 text-[11px] uppercase tracking-[0.08em] transition-colors duration-300 sm:text-[12px] lg:px-1 lg:text-[12px] lg:tracking-[0.05em] xl:px-2 xl:py-[11px] xl:text-[clamp(12px,0.78vw,15px)] xl:tracking-[0.08em] ${
                        on ? "font-bold text-white" : "font-semibold text-[#bdbdbd] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
                if (i === 0) return [link];
                // the slash is its own item, so it sits evenly between links
                return [
                  <li key={`sep-${i}`} aria-hidden="true" className="mx-1.5 text-[13px] font-light text-white/35 lg:mx-2 xl:mx-2.5 xl:text-[clamp(12px,0.8vw,16px)]">
                    /
                  </li>,
                  link,
                ];
              })}
              <span
                ref={line}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 block h-[2px] w-0 bg-white"
              />
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
