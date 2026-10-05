/**
 * Cross-section of the pond showing the three feeding zones.
 * Used (a) as the no-WebGL / reduced-motion story backdrop and (b) as an
 * explanatory figure in the "Why Rupa" section.
 * `active` dims the other zones to follow the scroll story.
 */
const FISH = "M0 0C10-9 30-10 44-2L57-10 54 0 57 10 44 2C30 10 10 9 0 0Z";
const SHRIMP = "M0 0C6-7 22-9 30-2 34 3 32 10 26 12L31 17 20 15C12 13 3 7 0 0Z";

export function PondDiagram({
  active = "all",
  className = "",
  title = "Cross-section of a pond showing where each Rupa feed works",
  fit = "contain",
}: {
  active?: string;
  className?: string;
  title?: string;
  fit?: "contain" | "cover";
}) {
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
      className={`pond-diagram ${className}`}
      data-active={active}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="pd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfdfe6" />
          <stop offset="1" stopColor="#eef0e8" />
        </linearGradient>
        <linearGradient id="pd-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a86a8" />
          <stop offset="0.55" stopColor="#0c4a6e" />
          <stop offset="1" stopColor="#082f49" />
        </linearGradient>
        <linearGradient id="pd-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="125" fill="url(#pd-sky)" />
      <path d="M0 116 C80 104 140 112 210 106 S360 100 430 110 600 102 680 108 800 104 800 104 V126 H0Z" fill="#33432b" opacity="0.85" />
      <rect y="122" width="800" height="478" fill="url(#pd-water)" />
      {[120, 330, 560].map((x) => (
        <path key={x} d={`M${x} 124 L${x + 70} 124 L${x + 150} 520 L${x + 40} 520Z`} fill="url(#pd-ray)" />
      ))}
      <path d="M0 123 Q25 119 50 123 T100 123 T150 123 T200 123 T250 123 T300 123 T350 123 T400 123 T450 123 T500 123 T550 123 T600 123 T650 123 T700 123 T750 123 T800 123" fill="none" stroke="#e8f2ee" strokeOpacity="0.8" strokeWidth="2" />
      <path d="M0 568 C120 556 220 574 340 562 S560 570 660 560 800 566 800 566 V600 H0Z" fill="#3b3628" />

      {/* zone 1 — floating */}
      <g className="zone z-floating">
        {[110, 128, 141, 160, 176, 190, 205, 222, 238].map((x, i) => (
          <ellipse key={x} cx={x} cy={121 + (i % 2)} rx="5" ry="3.2" fill="#b47a3c" />
        ))}
        <path d={FISH} fill="#cfd6cf" transform="translate(150 175) rotate(-38) scale(1.1)" />
        <path d={FISH} fill="#bfc8c0" transform="translate(222 200) rotate(-150) scale(0.9)" />
        <text x="175" y="98" textAnchor="middle" className="fill-[#1a2420] text-[17px] font-semibold">Floating</text>
        <text x="175" y="160" textAnchor="middle" className="fill-white/70 text-[12px]" dy="80">stays on the surface</text>
      </g>

      {/* zone 2 — sinking */}
      <g className="zone z-sinking">
        {Array.from({ length: 14 }, (_, i) => {
          const y = 140 + i * 29;
          const spread = 6 + i * 2.4;
          return (
            <g key={i}>
              <ellipse cx={415 - spread * ((i * 7) % 3 - 1) * 0.6} cy={y} rx="4.5" ry="3" fill="#a06c35" />
              {i % 3 === 0 && <ellipse cx={415 + spread} cy={y + 10} rx="4.5" ry="3" fill="#a06c35" />}
            </g>
          );
        })}
        <path d="M470 150 V500" stroke="#e3be7a" strokeOpacity="0.55" strokeDasharray="4 7" strokeWidth="2" />
        <path d="M462 492 L470 506 478 492" fill="none" stroke="#e3be7a" strokeOpacity="0.8" strokeWidth="2" />
        <path d={FISH} fill="#cfd6cf" transform="translate(360 300) rotate(20)" />
        <path d={FISH} fill="#c4ccc4" transform="translate(490 420) rotate(160) scale(1.05)" />
        <text x="415" y="98" textAnchor="middle" className="fill-[#1a2420] text-[17px] font-semibold">Sinking</text>
      </g>

      {/* zone 3 — polyculture */}
      <g className="zone z-poly">
        <path d="M560 400 L620 480 M740 400 L680 480" stroke="#9fb5a8" strokeOpacity="0.7" strokeWidth="2" />
        <path d="M560 400 H740" stroke="#9fb5a8" strokeOpacity="0.8" strokeWidth="3" />
        <path d="M650 124 V400" stroke="#cfc6ae" strokeOpacity="0.5" strokeWidth="1.2" />
        <ellipse cx="650" cy="124" rx="12" ry="6" fill="#e2dbc8" />
        <rect x="575" y="540" width="150" height="10" rx="3" fill="#2d3a2f" stroke="#9fb5a8" strokeOpacity="0.6" />
        {[600, 622, 640, 661, 683, 700].map((x) => (
          <ellipse key={x} cx={x} cy={538} rx="4.5" ry="3" fill="#a06c35" />
        ))}
        {[645, 655, 650].map((x, i) => (
          <ellipse key={i} cx={x} cy={420 + i * 34} rx="4.5" ry="3" fill="#a06c35" />
        ))}
        <path d={FISH} fill="#cbb791" transform="translate(560 500) rotate(-12) scale(1.1)" />
        <path d={FISH} fill="#bda983" transform="translate(770 470) rotate(170)" />
        <path d={SHRIMP} fill="#c9b99c" transform="translate(605 548) scale(1.05) rotate(180) translate(-30 0)" />
        <path d={SHRIMP} fill="#bfae90" transform="translate(705 552) scale(0.95)" />
        <text x="650" y="98" textAnchor="middle" className="fill-[#1a2420] text-[17px] font-semibold">Polyculture</text>
      </g>
    </svg>
  );
}
