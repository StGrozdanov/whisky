import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whisky — бутик",
  description: "Кратък избран списък уискита с дегустация от магазина",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
