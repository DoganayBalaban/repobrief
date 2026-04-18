import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "RepoBrief — Understand any GitHub repo in seconds",
  description:
    "AI-powered GitHub repository analysis. Get architecture diagrams, file maps, tech stack badges, and onboarding guides — streamed live by Claude.",
  metadataBase: new URL("https://repobrief.vercel.app"),
  openGraph: {
    title: "RepoBrief — Understand any GitHub repo in seconds",
    description:
      "AI-powered GitHub repository analysis. Architecture diagrams, file maps, tech stack badges, and onboarding guides — powered by Claude.",
    url: "https://repobrief.vercel.app",
    siteName: "RepoBrief",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoBrief — Understand any GitHub repo in seconds",
    description:
      "AI-powered GitHub repository analysis. Architecture diagrams, file maps, tech stack badges, and onboarding guides — powered by Claude.",
    creator: "@doganaybalaban",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
