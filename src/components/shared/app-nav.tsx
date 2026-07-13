"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Timer" },
  { href: "/stats", label: "Estatísticas" },
  { href: "/settings", label: "Configurações" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-20 flex items-center justify-between px-4 py-3 sm:px-6">
      {/* Logo / title */}
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold tracking-widest uppercase select-none"
        style={{
          color: "#ff2e97",
          textShadow: "0 0 8px rgba(255,46,151,0.7), 0 0 20px rgba(255,46,151,0.4)",
        }}
      >
        <span aria-hidden="true" className="text-[#05d9e8]" style={{
          textShadow: "0 0 8px rgba(5,217,232,0.7)",
        }}>▶</span>
        Pomodoro Lo‑Fi
      </Link>

      {/* Desktop nav links */}
      <nav className="hidden sm:flex items-center gap-6">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium tracking-wide transition-all duration-200",
                isActive
                  ? "text-[#05d9e8]"
                  : "text-[rgba(255,255,255,0.6)] hover:text-[#05d9e8]"
              )}
              style={
                isActive
                  ? { textShadow: "0 0 8px rgba(5,217,232,0.8)" }
                  : undefined
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right side: hamburger (mobile) + sign out */}
      <div className="flex items-center gap-3">
        {/* Hamburger button — mobile only */}
        <button
          className="sm:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 cursor-pointer"
          aria-label="Abrir menu de navegação"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={cn(
              "block h-0.5 w-5 transition-all duration-200",
              menuOpen ? "rotate-45 translate-y-[7px] bg-[#ff2e97]" : "bg-[rgba(255,255,255,0.7)]"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 transition-all duration-200",
              menuOpen ? "opacity-0" : "bg-[rgba(255,255,255,0.7)]"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 transition-all duration-200",
              menuOpen ? "-rotate-45 -translate-y-[7px] bg-[#ff2e97]" : "bg-[rgba(255,255,255,0.7)]"
            )}
          />
        </button>

        {/* Sign out */}
        <button
          onClick={async () => { await signOut(); router.push("/login"); }}
          className="text-sm font-medium text-[rgba(255,255,255,0.5)] hover:text-[#ff2e97] transition-colors duration-200 cursor-pointer"
        >
          Sair
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          className="sm:hidden absolute top-full left-0 right-0 z-30 flex flex-col gap-1 px-4 py-3"
          style={{
            background: "rgba(10,5,20,0.97)",
            borderBottom: "1px solid rgba(255,46,151,0.3)",
            boxShadow: "0 4px 24px rgba(255,46,151,0.15)",
          }}
        >
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "py-2 px-2 text-sm font-medium tracking-wide transition-all duration-200 rounded",
                  isActive
                    ? "text-[#05d9e8]"
                    : "text-[rgba(255,255,255,0.6)] hover:text-[#05d9e8]"
                )}
                style={
                  isActive
                    ? { textShadow: "0 0 8px rgba(5,217,232,0.8)" }
                    : undefined
                }
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
