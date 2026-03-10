import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "محرك السيرة المعرفي — Islamic Knowledge Engine",
  description: "An interactive timeline connecting Seerah, Quran, and Hadith chronologically",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
