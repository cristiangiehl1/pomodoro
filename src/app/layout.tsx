import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/app/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonte display "storybook" para títulos — dá o toque ilustrado Ghibli.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s · Pomodoro Lo‑Fi",
    default: "Pomodoro Lo‑Fi",
  },
  description:
    "Timer Pomodoro com música lo‑fi e ambientação Studio Ghibli para manter o foco.",
  keywords: ["pomodoro", "foco", "lofi", "ghibli", "timer", "produtividade"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
