import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
