import Link from "next/link";
import { ArrowRight } from "./Icons";

/** Placeholder for pages that haven't been designed yet. */
export default function ComingSoon({ title }: { title: string }) {
  return (
    <section className="relative flex min-h-svh flex-col items-start justify-end gap-6 overflow-hidden px-[max(4vw,16px)] pb-16 pt-40">
      <div
        aria-hidden="true"
        className="display outline-text pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[clamp(90px,18vw,260px)] leading-none [--stroke:#232323]"
      >
        {title}
      </div>
      <span className="label text-mute">Coming next</span>
      <h1 className="display text-[clamp(40px,6vw,80px)] leading-none">{title}</h1>
      <p className="max-w-md text-soft">This page is being designed next. Check back soon.</p>
      <Link href="/" className="label inline-flex items-center gap-2 hover:underline">
        Back home <ArrowRight />
      </Link>
    </section>
  );
}
