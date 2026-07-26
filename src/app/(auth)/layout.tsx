import Link from "next/link";
import { AtmosphereScene } from "@/components/shared/atmosphere-scene";

/**
 * Shell das rotas de autenticação — ambientação Ghibli lo-fi: a cena ao fundo
 * e um cartão de formulário centralizado.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <AtmosphereScene scene="castle" variant="immersive" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-2 text-center"
        >
          <span aria-hidden="true" className="text-4xl drop-shadow-sm">
            🍃
          </span>
          <span className="font-display text-3xl font-semibold text-foreground">
            Pomodoro Lo‑Fi
          </span>
          <span className="text-sm text-muted-foreground">
            Respire fundo. Foque no que importa.
          </span>
        </Link>

        {children}
      </div>
    </div>
  );
}
