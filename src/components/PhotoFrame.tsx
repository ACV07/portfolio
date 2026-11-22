import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  placeholder: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  fit?: string;
};

/** Shows the photo if one is set in site.ts, otherwise a labelled placeholder. */
export default function PhotoFrame({ src, alt, className = "", placeholder, sizes = "360px", priority, fit = "object-cover" }: Props) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`${fit} grayscale`} />
      ) : (
        placeholder
      )}
    </div>
  );
}
