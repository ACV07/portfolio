import type { Metadata, Viewport } from "next";
import "@fontsource/anton/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "./globals.css";
import Nav from "@/components/Nav";
import Loader from "@/components/Loader";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.tagline,
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink">
        <Loader />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
