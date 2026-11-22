import { site } from "@/data/site";

/**
 * "Origin & foundations": the first layer of the Experience section.
 * Its step lines join into one line that becomes the Experience timeline (see Experience).
 */
export default function Timeline() {
  return (
    <div data-origin className="absolute inset-0 z-[5] px-[max(4vw,16px)] pt-28 sm:pt-32">
      <h2 id="origin" data-origin-part className="display mb-10 text-[clamp(32px,4vw,52px)] leading-[1.05]">
        Origin &amp; foundations
      </h2>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-8 gap-y-6">
        {site.timeline.map((s) => (
          <li key={s.title} className="flex flex-col gap-1.5">
            <span data-step-line className="mb-3 block h-px bg-ink" />
            <div data-origin-part className="flex flex-col gap-1.5">
              <span className="label text-mute">{s.when}</span>
              <b className="text-lg">{s.title}</b>
              <span className="text-mute">{s.text}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
