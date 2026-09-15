import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AgeGate } from "@/components/age-gate";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "@material-symbols/font-400/outlined.css";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whisky Finder",
  description: "Специално подбран каталог от уискита",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`dark ${playfair.variable} ${jakarta.variable}`} lang="bg">
      <body className="bg-surface font-body text-body-md text-on-surface antialiased">
        <AgeGate />
        <SiteHeader />
        <main className="min-h-[calc(100vh-112px)] w-full bg-surface pt-28">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
