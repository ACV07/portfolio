// Black hills and spires along the bottom of the sky. Pure SVG, no assets.

const W = 1440;
const H = 320;
const hill = (x: number) => 150 - 40 * Math.sin(x / 170) - 25 * Math.sin(x / 53 + 1);

const SPIRES = [
  [60, 330], [110, 250], [150, 420], [205, 280], [250, 360],
  [1240, 260], [1300, 340], [1370, 230],
] as const;

export default function Skyline() {
  let d = `M0 ${H}`;
  for (let x = 0; x <= W; x += 10) d += ` L${x} ${(H - hill(x)).toFixed(1)}`;
  d += ` L${W} ${H} Z`;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 ${-200} ${W} ${H + 200}`}
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full"
    >
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d={d} fill="#000" />
      {SPIRES.map(([x, h]) => {
        const base = H - hill(x);
        return (
          <g key={x}>
            <path d={`M${x - 14} ${base + 10} V${base - h * 0.55} L${x} ${base - h} L${x + 14} ${base - h * 0.55} V${base + 10} Z`} fill="#000" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={x - 4} y={base - h * 0.45 + k * 28} width="4" height="10" fill="rgba(255,235,200,.55)" />
            ))}
          </g>
        );
      })}
      <rect x="0" y={-200} width={W} height={H + 200} fill="url(#fade)" />
    </svg>
  );
}
