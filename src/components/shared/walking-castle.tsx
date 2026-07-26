// Framesheet do castelo: 24 frames num grid 6×4 (public/castelo-animato-grid.png).
// Sheet re-fatiado em células uniformes de 222×156 (1332×624), com o rodapé
// transparente aparado para o castelo encostar no bottom da página.
//
// A animação é 100% CSS (ver `.castle-sprite` em globals.css): dois keyframes
// em `steps()` — colunas passo-a-passo (6) e linhas 6× mais lentas (4) —
// percorrem os 24 frames em ordem row-major, dirigido pelo compositor, sem
// re-render do React. Parado (timer off) fica no frame 0.

/**
 * Castelo animado por spritesheet, em repouso no frame 0 e caminhando apenas
 * enquanto `html[data-timer-running="true"]` — o mesmo marcador que dispara a
 * esteira horizontal (`castle-march`).
 */
export function WalkingCastle() {
  return (
    <div
      aria-hidden
      className="castle-sprite h-20 w-24 bg-no-repeat drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]"
      style={{
        backgroundImage: "url(/castelo-animato-grid.png)",
        backgroundSize: "600% 410%",
      }}
    />
  );
}
