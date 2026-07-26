import Image from "next/image";
import { cn } from "@/lib/utils";
import { WalkingCastle } from "@/components/shared/walking-castle";

/**
 * Cena de ambiente lo-fi, inspirada em Spirited Away + Castelo Animado.
 *
 * A arte da cena entra ao fundo com um véu quente por cima (leitura), somada a
 * motivos genéricos em CSS/SVG (não reproduzem arte protegida): lanternas de
 * papel que balançam, "fuliginhas" (susuwatari) subindo e — só à noite —
 * estrelas e uma silhueta de castelo andante soltando fumaça.
 *
 * `scene`:
 *  - `spirit` — noite quente da casa de banho (`/spirit-away-lofi.png`);
 *  - `castle` — hora dourada do castelo andante (`/castelo-animado-lofi.png`).
 * `variant`:
 *  - `immersive` — a arte aparece nítida (telas de autenticação);
 *  - `subtle` — a arte fica desfocada e escurecida (fundo do app).
 */
type Scene = "spirit" | "castle";
type Variant = "immersive" | "subtle";

const SCENE_IMAGE: Record<Scene, string> = {
  spirit: "/spirit-away-lofi.png",
  castle: "/castelo-animado-lofi.png",
};

const LANTERNS = [
  { left: "8%", size: 26, delay: 0, drop: 46 },
  { left: "22%", size: 20, delay: -1.2, drop: 30 },
  { left: "78%", size: 22, delay: -0.6, drop: 38 },
  { left: "90%", size: 28, delay: -1.8, drop: 52 },
];

const SOOT = [
  { left: "12%", size: 12, duration: 26, delay: 0 },
  { left: "26%", size: 8, duration: 32, delay: -8 },
  { left: "40%", size: 14, duration: 30, delay: -3 },
  { left: "58%", size: 9, duration: 34, delay: -16 },
  { left: "72%", size: 11, duration: 28, delay: -6 },
  { left: "85%", size: 8, duration: 36, delay: -20 },
];

const STARS = [
  { left: "14%", top: "12%", size: 3, delay: 0 },
  { left: "30%", top: "8%", size: 2, delay: -1.5 },
  { left: "48%", top: "16%", size: 3, delay: -0.8 },
  { left: "64%", top: "9%", size: 2, delay: -2.2 },
  { left: "82%", top: "14%", size: 3, delay: -1.1 },
  { left: "92%", top: "6%", size: 2, delay: -0.4 },
];

function Lantern({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 20 26" aria-hidden="true">
      <line x1="10" y1="0" x2="10" y2="4" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
      <ellipse cx="10" cy="14" rx="9" ry="11" fill="var(--lantern)" />
      <rect x="4" y="3" width="12" height="3" rx="1.5" fill="#3a1e18" />
      <rect x="4" y="22" width="12" height="3" rx="1.5" fill="#3a1e18" />
      <line x1="10" y1="6" x2="10" y2="22" stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
    </svg>
  );
}

function SootSprite({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {/* corpo fofo (raios irregulares) */}
      <circle cx="12" cy="12" r="8" fill="rgba(var(--soot), 0.92)" />
      <g stroke="rgba(var(--soot), 0.92)" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="5" y1="5" x2="7" y2="7" />
        <line x1="17" y1="17" x2="19" y2="19" />
        <line x1="19" y1="5" x2="17" y2="7" />
        <line x1="7" y1="17" x2="5" y2="19" />
      </g>
      {/* olhinhos */}
      <circle cx="9.5" cy="11.5" r="1.5" fill="#fff" />
      <circle cx="14.5" cy="11.5" r="1.5" fill="#fff" />
      <circle cx="9.5" cy="11.5" r="0.6" fill="#000" />
      <circle cx="14.5" cy="11.5" r="0.6" fill="#000" />
    </svg>
  );
}


export function AtmosphereScene({
  scene = "spirit",
  variant = "subtle",
}: {
  scene?: Scene;
  variant?: Variant;
}) {
  const immersive = variant === "immersive";
  const isNight = scene === "spirit";

  return (
    <div className="grain-overlay fixed inset-0 -z-10 overflow-hidden bg-(--night-top)">
      {/* Arte da cena ao fundo */}
      <Image
        src={SCENE_IMAGE[scene]}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn(
          "object-cover object-center",
          immersive ? "opacity-90" : "scale-105 opacity-70 blur-[2px]",
        )}
      />

      {/* Véu quente escuro para leitura */}
      <div
        className="absolute inset-0"
        style={{
          background: immersive
            ? "linear-gradient(180deg, rgba(15,11,8,0.6) 0%, rgba(15,11,8,0.28) 45%, rgba(20,14,10,0.72) 100%)"
            : "linear-gradient(180deg, rgba(15,11,8,0.32) 0%, rgba(20,14,10,0.16) 45%, rgba(15,11,8,0.42) 100%)",
        }}
      />

      {/* Estrelas cintilando — só na cena noturna */}
      {isNight &&
        STARS.map((star, i) => (
          <span
            key={`star-${i}`}
            className="absolute rounded-full"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              background: "rgba(var(--ember), 0.95)",
              boxShadow: "0 0 6px rgba(var(--ember), 0.8)",
              animation: `ghibli-twinkle ${3 + i * 0.4}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}

      {/* Silhueta do castelo andante — só na cena noturna (a cena de dia já tem um) */}
      {isNight && (
        <div className="walking-castle absolute bottom-0 -left-20 opacity-90">
          <WalkingCastle />
        </div>
      )}

      {/* Lanternas de papel penduradas, balançando */}
      {LANTERNS.map((lantern, i) => (
        <div
          key={`lantern-${i}`}
          className="glow-lantern absolute top-0 origin-top rounded-full"
          style={{
            left: lantern.left,
            marginTop: lantern.drop,
            animation: `ghibli-sway ${4 + i * 0.5}s ease-in-out ${lantern.delay}s infinite`,
          }}
        >
          <Lantern size={lantern.size} />
        </div>
      ))}

      {/* Susuwatari (fuliginhas) subindo */}
      {SOOT.map((soot, i) => (
        <span
          key={`soot-${i}`}
          className="absolute bottom-0"
          style={{
            left: soot.left,
            animation: `ghibli-float ${soot.duration}s ease-in-out ${soot.delay}s infinite`,
          }}
        >
          <SootSprite size={soot.size} />
        </span>
      ))}
    </div>
  );
}
