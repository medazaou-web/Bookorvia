import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Bookorvia - Professional Booking & Loyalty",
  description: "Turn first-time clients into loyal regulars with smart booking, reviews, and loyalty tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
        className={`${displayFont.variable} ${monoFont.variable} h-full antialiased scroll-smooth`}
    >
      <body className="app-canvas min-h-full flex flex-col transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
