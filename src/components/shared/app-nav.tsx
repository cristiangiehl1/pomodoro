"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/shared/user-menu";

const navLinks = [
  { href: "/", label: "Timer" },
  { href: "/stats", label: "Estatísticas" },
  { href: "/settings", label: "Configurações" },
];

export function AppNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-border/60 bg-card/60 px-4 py-3 backdrop-blur-md sm:px-6">
      {/* Marca */}
      <Link
        href="/"
        className="flex select-none items-center gap-2 font-display text-lg font-semibold text-foreground"
      >
        <span aria-hidden="true">🍃</span>
        Pomodoro Lo‑Fi
      </Link>

      {/* Navegação — desktop */}
      <nav className="hidden items-center gap-6 sm:flex">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Lado direito: hambúrguer (mobile) + menu do usuário */}
      <div className="flex items-center gap-3">
        <button
          className="flex h-8 w-8 cursor-pointer flex-col items-center justify-center gap-[5px] sm:hidden"
          aria-label="Abrir menu de navegação"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={cn(
              "block h-0.5 w-5 bg-foreground/70 transition-all duration-200",
              menuOpen && "translate-y-[7px] rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 bg-foreground/70 transition-all duration-200",
              menuOpen && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 bg-foreground/70 transition-all duration-200",
              menuOpen && "-translate-y-1.75 -rotate-45",
            )}
          />
        </button>

        <UserMenu />
      </div>

      {/* Menu dropdown — mobile */}
      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full z-30 flex flex-col gap-1 border-b border-border/60 bg-card/95 px-4 py-3 shadow-soft backdrop-blur-md sm:hidden">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-2 py-2 text-sm font-medium tracking-wide transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
