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

// On every full load or refresh, forget the old scroll position and any #section in the URL,
// so the site always starts at the name page (after the loading screen).
const startAtTop = `try{history.scrollRestoration="manual";if(location.hash)history.replaceState(null,"",location.pathname+location.search);window.scrollTo(0,0)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink">
        <script dangerouslySetInnerHTML={{ __html: startAtTop }} />
        <Loader />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
