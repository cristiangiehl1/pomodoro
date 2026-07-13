"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Timer" },
  { href: "/stats", label: "Estatísticas" },
  { href: "/settings", label: "Configurações" },
];

export function AppNav() {
  const pathname = usePathname();

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

      {/* Nav links */}
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

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-sm font-medium text-[rgba(255,255,255,0.5)] hover:text-[#ff2e97] transition-colors duration-200 cursor-pointer"
      >
        Sair
      </button>
    </header>
  );
}
