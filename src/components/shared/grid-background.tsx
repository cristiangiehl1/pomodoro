export function GridBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep dark purple base */}
      <div className="absolute inset-0 bg-[#0d0015]" />

      {/* Radial gradient glow at horizon */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "60%",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,46,151,0.25) 0%, rgba(5,217,232,0.08) 45%, transparent 70%)",
        }}
      />

      {/* Top sky gradient */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "50%",
          background:
            "linear-gradient(to bottom, #0d0015 0%, rgba(13,0,21,0) 100%)",
        }}
      />

      {/* Perspective grid SVG */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ height: "55%" }}
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(5,217,232,0)" />
            <stop offset="40%" stopColor="rgba(5,217,232,0.4)" />
            <stop offset="100%" stopColor="rgba(5,217,232,0.7)" />
          </linearGradient>
          <linearGradient id="gridFadeH" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,46,151,0)" />
            <stop offset="50%" stopColor="rgba(255,46,151,0.25)" />
            <stop offset="100%" stopColor="rgba(255,46,151,0.5)" />
          </linearGradient>
          <mask id="gridMask">
            <rect x="0" y="0" width="1000" height="500" fill="white" />
          </mask>
        </defs>

        {/* Vertical perspective lines (converging to vanishing point at 500,0) */}
        {[-500, -350, -200, -100, -50, 0, 50, 100, 200, 350, 500, 650, 700, 800, 1000, 1150].map(
          (x, i) => (
            <line
              key={`v${i}`}
              x1={500}
              y1={0}
              x2={x}
              y2={500}
              stroke="url(#gridFade)"
              strokeWidth="0.8"
            />
          )
        )}

        {/* Horizontal lines (evenly spaced but perspective-mapped) */}
        {[0.08, 0.18, 0.3, 0.44, 0.58, 0.72, 0.86, 1.0].map((t, i) => {
          const y = t * 500;
          const spread = t * 1000;
          const x1 = 500 - spread / 2;
          const x2 = 500 + spread / 2;
          return (
            <line
              key={`h${i}`}
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke="url(#gridFadeH)"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>

      {/* Subtle scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)",
        }}
      />
    </div>
  );
}
