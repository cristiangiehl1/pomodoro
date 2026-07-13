import type { Metadata } from "next";
import { GridBackground } from "@/components/shared/grid-background";
import { AppNav } from "@/components/shared/app-nav";
import { HomeView } from "@/features/home/components/home-view";

export const metadata: Metadata = {
  title: "Timer",
  description:
    "Timer Pomodoro retro synthwave com música lo‑fi. Foque, descanse, repita.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <GridBackground />
      <AppNav />
      <HomeView />
    </div>
  );
}
