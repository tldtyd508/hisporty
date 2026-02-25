import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HiSporty | 당신의 스포츠 라이프",
  description: "스포츠를 즐기는 새로운 방법, HiSporty에서 시작하세요.",
  openGraph: {
    title: "HiSporty | 당신의 스포츠 라이프",
    description: "스포츠를 즐기는 새로운 방법, HiSporty에서 시작하세요.",
    url: "https://hisporty.vercel.app",
    siteName: "HiSporty",
    images: [{ url: "https://hisporty.vercel.app/og-image.png", width: 1200, height: 630 }],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
