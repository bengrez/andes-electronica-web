// Industria patterns — 6 generative SVG visuals + Chile operational map
// Each pattern reacts on hover via the `active` prop (true = animation on)

function PatternTransporte({ accent, ink, active }) {
  // SACEL telemetry: bus icon at center, data packets streaming up to satellite/cloud, fleet dots below
  const buses = [{ x: 50, y: 165 }, { x: 100, y: 168 }, { x: 150, y: 165 }, { x: 200, y: 170 }, { x: 240, y: 167 }];
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="sacel-glow" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={accent} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="280" height="200" fill="url(#sacel-glow)" opacity={active ? 0.7 : 0.3} style={{ transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1)' }}/>
      {/* Cloud / satellite hub at top */}
      <g opacity="0.85">
        <line x1="120" y1="35" x2="160" y2="35" stroke={accent} strokeWidth="1" opacity="0.5"/>
        <rect x="125" y="22" width="30" height="14" fill="none" stroke={accent} strokeWidth="1.2" rx="2"/>
        <text x="140" y="32" fontSize="6" fill={accent} textAnchor="middle" fontFamily="JetBrains Mono, monospace" letterSpacing="1.2">SACEL</text>
        {/* Antenna lines */}
        <line x1="135" y1="22" x2="132" y2="14" stroke={accent} strokeWidth="0.8"/>
        <line x1="145" y1="22" x2="148" y2="14" stroke={accent} strokeWidth="0.8"/>
        <circle cx="132" cy="14" r="1.5" fill={accent}/>
        <circle cx="148" cy="14" r="1.5" fill={accent}/>
      </g>
      {/* Ground line */}
      <line x1="0" y1="180" x2="280" y2="180" stroke={accent} strokeWidth="0.5" opacity="0.35" strokeDasharray="2 4"/>
      {/* Bus fleet */}
      {buses.map((b, i) => (
        <g key={i}>
          {/* Simple bus silhouette */}
          <rect x={b.x - 10} y={b.y - 8} width="20" height="10" fill="none" stroke={accent} strokeWidth="1" opacity={active ? 0.85 : 0.55} style={{ transition: 'opacity 400ms' }}/>
          <rect x={b.x - 8} y={b.y - 6} width="4" height="3" fill={accent} opacity="0.4"/>
          <rect x={b.x - 2} y={b.y - 6} width="4" height="3" fill={accent} opacity="0.4"/>
          <rect x={b.x + 4} y={b.y - 6} width="4" height="3" fill={accent} opacity="0.4"/>
          <circle cx={b.x - 6} cy={b.y + 2} r="1.2" fill={accent}/>
          <circle cx={b.x + 6} cy={b.y + 2} r="1.2" fill={accent}/>
          {/* Telemetry uplink: dashed line from each bus to hub */}
          <line x1={b.x} y1={b.y - 8} x2="140" y2="38"
            stroke={accent} strokeWidth="0.5" opacity={active ? 0.5 : 0.18}
            strokeDasharray="2 3"
            style={{
              transition: 'opacity 500ms',
              animation: active ? `sacelUplink 1.8s linear infinite` : 'none',
              animationDelay: `${i * 0.18}s`,
            }}
          />
          {/* Data packet dot traveling up */}
          {active && (
            <circle r="1.8" fill={accent}>
              <animate attributeName="cx" values={`${b.x};140`} dur="1.8s" begin={`${i * 0.18}s`} repeatCount="indefinite"/>
              <animate attributeName="cy" values={`${b.y - 8};38`} dur="1.8s" begin={`${i * 0.18}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" begin={`${i * 0.18}s`} repeatCount="indefinite"/>
            </circle>
          )}
        </g>
      ))}
      <style>{`
        @keyframes sacelUplink { to { stroke-dashoffset: -10; } }
      `}</style>
    </svg>
  );
}

function PatternMineria({ accent, ink, active }) {
  // Open-pit mine: stepped terraces in cross-section, line-art style. Particles drift on hover.
  // Each terrace = a horizontal segment with vertical risers, forming a stepped V.
  const terraces = [
    { y: 50, xL: 20, xR: 260 },
    { y: 75, xL: 50, xR: 230 },
    { y: 100, xL: 78, xR: 202 },
    { y: 125, xL: 104, xR: 176 },
    { y: 150, xL: 128, xR: 152 },
  ];
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Sky / horizon line */}
      <line x1="0" y1="50" x2="280" y2="50" stroke={accent} strokeWidth="0.5" opacity="0.3" strokeDasharray="3 4"/>
      {/* Stepped terraces with risers connecting them */}
      {terraces.map((t, i) => {
        const next = terraces[i + 1];
        return (
          <g key={i}>
            {/* Bench (horizontal) */}
            <line x1={t.xL} y1={t.y} x2={t.xR} y2={t.y}
              stroke={accent} strokeWidth={i === terraces.length - 1 ? 1.4 : 1}
              opacity={active ? 0.85 : 0.6} style={{ transition: 'opacity 500ms' }}/>
            {/* Bench texture dots */}
            {Array.from({ length: 6 }, (_, j) => {
              const x = t.xL + ((t.xR - t.xL) / 7) * (j + 1);
              return <circle key={j} cx={x} cy={t.y + 2} r="0.6" fill={accent} opacity={active ? 0.6 : 0.35} style={{ transition: 'opacity 500ms' }}/>;
            })}
            {/* Risers down to next bench */}
            {next && (
              <>
                <line x1={t.xL} y1={t.y} x2={next.xL} y2={next.y} stroke={accent} strokeWidth="0.8" opacity={active ? 0.7 : 0.45} style={{ transition: 'opacity 500ms' }}/>
                <line x1={t.xR} y1={t.y} x2={next.xR} y2={next.y} stroke={accent} strokeWidth="0.8" opacity={active ? 0.7 : 0.45} style={{ transition: 'opacity 500ms' }}/>
              </>
            )}
          </g>
        );
      })}
      {/* Haul road switchback (zigzag down right side) */}
      <polyline
        points="246,52 240,72 250,76 220,98 230,102 200,124 210,128 180,148"
        fill="none" stroke={accent} strokeWidth="0.7" opacity={active ? 0.7 : 0.4} strokeDasharray="2 3"
        style={{ transition: 'opacity 500ms' }}
      />
      {/* Haul truck dot moving along road on hover */}
      {active && (
        <circle r="2" fill={accent}>
          <animateMotion dur="4.2s" repeatCount="indefinite"
            path="M 246 52 L 240 72 L 250 76 L 220 98 L 230 102 L 200 124 L 210 128 L 180 148"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="4.2s" repeatCount="indefinite"/>
        </circle>
      )}
      {/* Pit bottom marker */}
      <circle cx="140" cy="150" r="3" fill="none" stroke={accent} strokeWidth="1" opacity="0.7"/>
      <circle cx="140" cy="150" r="1.2" fill={accent} opacity={active ? 1 : 0.7} style={{ transition: 'opacity 400ms' }}/>
      {/* Depth scale on left */}
      <g opacity="0.5">
        {[50, 75, 100, 125, 150].map((y, i) => (
          <g key={i}>
            <line x1="6" y1={y} x2="14" y2={y} stroke={accent} strokeWidth="0.5"/>
            <text x="2" y={y + 2} fontSize="5.5" fill={accent} fontFamily="JetBrains Mono, monospace" letterSpacing="0.5">{`-${i * 50}`}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function PatternDefensa({ accent, ink, active }) {
  // Security shield with concentric rings + lock node — shield pulses on hover, no targeting/violence imagery
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Background dotted grid (subtle) */}
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          {Array.from({ length: 14 }, (_, j) => (
            <circle key={j} cx={j * 20 + 10} cy={i * 20 + 10} r="0.5" fill={accent} opacity="0.15"/>
          ))}
        </g>
      ))}
      {/* Shield shape (heraldic, line-art) — centered */}
      <g style={{ transformOrigin: '140px 100px', transform: active ? 'scale(1.04)' : 'scale(1)', transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Shield outline */}
        <path
          d="M 140 50 L 180 62 L 180 110 Q 180 138 140 156 Q 100 138 100 110 L 100 62 Z"
          fill="none" stroke={accent} strokeWidth="1.4" opacity="0.85"
        />
        {/* Inner shield (offset) */}
        <path
          d="M 140 60 L 172 70 L 172 110 Q 172 132 140 146 Q 108 132 108 110 L 108 70 Z"
          fill="none" stroke={accent} strokeWidth="0.7" opacity="0.5" strokeDasharray="3 3"
        />
        {/* Center lock/checkmark glyph */}
        <g transform="translate(140, 105)">
          {/* Lock body */}
          <rect x="-10" y="-2" width="20" height="16" fill="none" stroke={accent} strokeWidth="1" opacity="0.85" rx="1"/>
          {/* Lock shackle */}
          <path d="M -6 -2 L -6 -10 Q -6 -16 0 -16 Q 6 -16 6 -10 L 6 -2" fill="none" stroke={accent} strokeWidth="1" opacity="0.85"/>
          {/* Keyhole */}
          <circle cx="0" cy="5" r="1.5" fill={accent}/>
          <line x1="0" y1="5" x2="0" y2="10" stroke={accent} strokeWidth="1.2"/>
        </g>
      </g>
      {/* Concentric pulse rings around shield (animated on hover) */}
      {[40, 60, 80].map((r, i) => (
        <circle key={i} cx="140" cy="100" r={r} fill="none" stroke={accent} strokeWidth="0.6"
          opacity={active ? 0.4 - i * 0.08 : 0.18 - i * 0.04}
          style={{
            transformOrigin: '140px 100px',
            animation: active ? `securityPulse 2.6s cubic-bezier(0.16,1,0.3,1) infinite` : 'none',
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
      {/* Corner integrity markers (4 corners) */}
      {[[20, 20], [260, 20], [20, 180], [260, 180]].map(([x, y], i) => (
        <g key={i} opacity="0.7">
          <circle cx={x} cy={y} r="2.5" fill="none" stroke={accent} strokeWidth="0.8"/>
          <circle cx={x} cy={y} r="0.8" fill={accent}/>
        </g>
      ))}
      {/* Status label */}
      <text x="140" y="184" fontSize="6" fill={accent} textAnchor="middle" fontFamily="JetBrains Mono, monospace" letterSpacing="1.4" opacity={active ? 0.85 : 0.55} style={{ transition: 'opacity 500ms' }}>
        INTEGRIDAD · CADENA DE CUSTODIA
      </text>
      <style>{`
        @keyframes securityPulse {
          0% { transform: scale(0.85); opacity: 0; }
          40% { opacity: 0.5; }
          100% { transform: scale(1.25); opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

function PatternTelco({ accent, ink, active }) {
  // Towers + propagation arcs — arcs ripple outward on hover
  const towers = [{ x: 60, y: 140 }, { x: 140, y: 110 }, { x: 220, y: 150 }];
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Ground line */}
      <line x1="0" y1="180" x2="280" y2="180" stroke={accent} strokeWidth="0.6" opacity="0.4"/>
      {towers.map((t, i) => (
        <g key={i}>
          {/* Tower */}
          <line x1={t.x} y1={t.y} x2={t.x} y2="180" stroke={accent} strokeWidth="1.2" opacity="0.85"/>
          <line x1={t.x - 6} y1={t.y + 12} x2={t.x + 6} y2={t.y + 12} stroke={accent} strokeWidth="0.6" opacity="0.6"/>
          <line x1={t.x - 4} y1={t.y + 24} x2={t.x + 4} y2={t.y + 24} stroke={accent} strokeWidth="0.6" opacity="0.5"/>
          <circle cx={t.x} cy={t.y} r="2" fill={accent}/>
          {/* Propagation arcs */}
          {[20, 35, 50, 65].map((r, j) => (
            <circle key={j} cx={t.x} cy={t.y} r={r} fill="none" stroke={accent} strokeWidth="0.6"
              opacity={active ? 0.45 - j * 0.08 : 0.25 - j * 0.05}
              style={{
                transformOrigin: `${t.x}px ${t.y}px`,
                animation: active ? `telcoPulse 2.4s cubic-bezier(0.16,1,0.3,1) infinite` : 'none',
                animationDelay: `${(i * 0.3 + j * 0.6)}s`,
              }}
            />
          ))}
        </g>
      ))}
      <style>{`
        @keyframes telcoPulse {
          0% { transform: scale(0.6); opacity: 0; }
          30% { opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

function PatternEnergia({ accent, ink, active }) {
  // One-line electrical diagram — current flows on hover
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Main bus bar */}
      <line x1="20" y1="100" x2="260" y2="100" stroke={accent} strokeWidth="1.4" opacity="0.85"/>
      {/* Top bus */}
      <line x1="40" y1="40" x2="240" y2="40" stroke={accent} strokeWidth="0.8" opacity="0.5"/>
      {/* Bottom bus */}
      <line x1="40" y1="160" x2="240" y2="160" stroke={accent} strokeWidth="0.8" opacity="0.5"/>
      {/* Vertical taps with breakers */}
      {[60, 110, 160, 210].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="40" x2={x} y2="100" stroke={accent} strokeWidth="0.7" opacity="0.6"/>
          <line x1={x} y1="100" x2={x} y2="160" stroke={accent} strokeWidth="0.7" opacity="0.6"/>
          {/* Breaker box */}
          <rect x={x - 4} y="65" width="8" height="8" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.7"/>
          <rect x={x - 4} y="127" width="8" height="8" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.7"/>
        </g>
      ))}
      {/* Transformer symbol */}
      <g transform="translate(140, 100)">
        <circle cx="-6" cy="0" r="6" fill="none" stroke={accent} strokeWidth="1" opacity="0.8"/>
        <circle cx="6" cy="0" r="6" fill="none" stroke={accent} strokeWidth="1" opacity="0.8"/>
      </g>
      {/* Animated current dots */}
      {active && [40, 60, 110, 160, 210, 240].map((x, i) => (
        <circle key={i} cx={x} cy="100" r="2" fill={accent}>
          <animate attributeName="cy" values="40;100;160;100;40" dur="2.6s" begin={`${i * 0.18}s`} repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0;1;0" dur="2.6s" begin={`${i * 0.18}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      {/* Source/load icons */}
      <text x="20" y="105" fontSize="7" fill={accent} fontFamily="monospace" opacity="0.7">G</text>
      <text x="262" y="105" fontSize="7" fill={accent} fontFamily="monospace" opacity="0.7">L</text>
    </svg>
  );
}

function PatternSalud({ accent, ink, active }) {
  // ECG waveform — waveform sweeps on hover
  // Build a typical ECG path
  const ecg = "M 0 100 L 30 100 L 35 100 L 40 95 L 45 100 L 55 100 L 58 70 L 62 130 L 66 60 L 70 100 L 90 100 L 95 100 L 100 92 L 110 108 L 120 100 L 145 100 L 150 100 L 155 95 L 160 100 L 170 100 L 173 70 L 177 130 L 181 60 L 185 100 L 205 100 L 210 100 L 215 92 L 225 108 L 235 100 L 280 100";
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Faint grid */}
      {Array.from({ length: 14 }, (_, i) => (
        <line key={`v${i}`} x1={i * 20} y1="40" x2={i * 20} y2="160" stroke={accent} strokeWidth="0.3" opacity="0.12"/>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={40 + i * 20} x2="280" y2={40 + i * 20} stroke={accent} strokeWidth="0.3" opacity="0.12"/>
      ))}
      {/* Static trace (faint) */}
      <path d={ecg} fill="none" stroke={accent} strokeWidth="0.8" opacity="0.25"/>
      {/* Active trace — drawn with stroke-dashoffset animation */}
      <path d={ecg} fill="none" stroke={accent} strokeWidth="1.5"
        strokeDasharray="600"
        strokeDashoffset={active ? 0 : 600}
        style={{
          transition: active ? 'stroke-dashoffset 1.6s cubic-bezier(0.5,0,0.4,1)' : 'stroke-dashoffset 250ms ease-out',
          filter: active ? `drop-shadow(0 0 4px ${accent})` : 'none',
        }}
      />
      {/* Pulse dot at end */}
      {active && (
        <circle cx="270" cy="100" r="3" fill={accent}>
          <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite"/>
        </circle>
      )}
    </svg>
  );
}

// ─── Chile operational map ─────────────────────────────────────────
// Real geographic SVG (1640x280, horizontal) — we rotate -90deg to render vertically.
// Pin positions are in the ORIGINAL horizontal coordinate space.
function ChileMap({ accent, ink, inkSub, inkDim, inkFaint, surface }) {
  const [hover, setHover] = React.useState(null);
  const [svgMarkup, setSvgMarkup] = React.useState(null);
  const containerRef = React.useRef(null);

  // Load real Chile SVG once
  React.useEffect(() => {
    let cancel = false;
    fetch('assets/maps/chile.svg')
      .then(r => r.text())
      .then(txt => {
        if (cancel) return;
        // Strip outer <svg> tag — we render its inner content inside our own <svg>
        const inner = txt.replace(/<\?xml[^?]*\?>/, '').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
        setSvgMarkup(inner);
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, []);

  // Pins in the ORIGINAL horizontal SVG coordinate space (viewBox 0 0 1640 280)
  // Approx coords aligned to each region's path (north = right, south = left in original)
  const nodes = [
    { id: 'arica',       label: 'Arica',        industry: 'Minería · Logística',          x: 18,    y: 102 },
    { id: 'antofagasta', label: 'Antofagasta',  industry: 'Minería',                      x: 175,   y: 88  },
    { id: 'lasere',      label: 'La Serena',    industry: 'Energía · Minería',            x: 470,   y: 138 },
    { id: 'valparaiso',  label: 'Valparaíso',   industry: 'Telecom · Logística',          x: 600,   y: 152 },
    { id: 'santiago',    label: 'Santiago',     industry: 'Transporte · Sede',            x: 645,   y: 142 },
    { id: 'concepcion',  label: 'Concepción',   industry: 'Energía · Industrial',         x: 800,   y: 165 },
    { id: 'temuco',      label: 'Temuco',       industry: 'Forestal · Energía',           x: 870,   y: 195 },
    { id: 'puertomontt', label: 'Puerto Montt', industry: 'Acuicultura · Logística',      x: 950,   y: 230 },
    { id: 'puntaarenas', label: 'Punta Arenas', industry: 'Defensa · Logística austral',  x: 1320,  y: 252 },
  ];

  // Transform pin from original (1640x280) into rotated (280x1640) space
  // Rotation -90deg around origin then translate Y by 280 → (x',y') = (y, 1640 - x)
  const rotPin = (n) => ({ ...n, rx: n.y, ry: 1640 - n.x });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'center', minHeight: 600 }}>
      {/* Left: Map (rotated to vertical) */}
      <div ref={containerRef} style={{ position: 'relative', height: 620, display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 280 1640"
          preserveAspectRatio="xMidYMid meet"
          style={{ height: '100%', width: 'auto', display: 'block' }}
        >
          <defs>
            <style>{`
              .map-chile.s0 { fill: ${accent}; opacity: 0.55; }
              .map-chile.s1 { fill: rgba(212,165,116,0.06); stroke: ${accent}; stroke-width: 0.6; stroke-opacity: 0.55; transition: fill 250ms ease, stroke-opacity 250ms ease; }
              .map-chile.s1:hover { fill: rgba(212,165,116,0.18); stroke-opacity: 0.9; }
              .map-chile.s2 { fill: none; stroke: ${accent}; stroke-width: 0.4; stroke-opacity: 0.35; }
            `}</style>
          </defs>

          {/* Real Chile SVG content rotated -90° around (0,0), then shifted into the new viewBox */}
          <g transform="rotate(-90) translate(-1640 0)">
            {svgMarkup ? (
              <g dangerouslySetInnerHTML={{ __html: svgMarkup }} />
            ) : null}
          </g>

          {/* Pins, in rotated (280 x 1640) space */}
          {nodes.map(rotPin).map(n => {
            const isHover = hover === n.id;
            // Place label to the right of pin (positive x direction in rotated frame)
            const labelDx = 14;
            return (
              <g key={n.id}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={n.rx} cy={n.ry} r={isHover ? 14 : 7} fill="none" stroke={accent}
                  strokeWidth="1" opacity={isHover ? 0.9 : 0.5}
                  style={{ transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)' }}/>
                <circle cx={n.rx} cy={n.ry} r={isHover ? 4.5 : 3} fill={accent}
                  style={{ transition: 'all 300ms' }}/>
                <line
                  x1={n.rx} y1={n.ry}
                  x2={n.rx + labelDx} y2={n.ry}
                  stroke={accent} strokeWidth="0.6"
                  opacity={isHover ? 0.9 : 0.45}
                  strokeDasharray="2 2"
                />
                <text
                  x={n.rx + labelDx + 4}
                  y={n.ry - 4}
                  fontSize="14" fill={isHover ? accent : ink}
                  fontFamily="DM Sans, sans-serif" fontWeight="600"
                  textAnchor="start"
                  style={{ transition: 'fill 300ms' }}
                >
                  {n.label.toUpperCase()}
                </text>
                <text
                  x={n.rx + labelDx + 4}
                  y={n.ry + 12}
                  fontSize="10" fill={inkDim}
                  fontFamily="JetBrains Mono, monospace" letterSpacing="1.4"
                  textAnchor="start"
                >
                  {n.industry.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right: copy + stats */}
      <div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.22em', color: inkDim, textTransform: 'uppercase', fontWeight: 500, marginBottom: 24 }}>
          — Despliegue operacional
        </div>
        <h3 style={{ margin: 0, fontFamily: '"DM Serif Display", serif', fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.02em', color: ink, fontWeight: 400, maxWidth: 520 }}>
          Equipos en operación desde Antofagasta hasta Magallanes.
        </h3>
        <div style={{ marginTop: 28, height: 1, width: 64, background: accent }}/>
        <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.6, color: inkSub, maxWidth: 520 }}>
          Tres décadas instalando, manteniendo y soportando sistemas a lo largo del país. Desde plataformas mineras del norte hasta logística austral — con respuesta técnica local en cada zona.
        </p>
        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${inkFaint}`, borderRight: 'none', borderBottom: 'none' }}>
          {[
            { v: '15', sub: 'REGIONES', d: 'Cobertura nacional' },
            { v: '6', sub: 'INDUSTRIAS', d: 'Verticales activos' },
            { v: '140+', sub: 'OPERADORES', d: 'Flotas y plantas' },
            { v: '5.000+', sub: 'EQUIPOS', d: 'En operación continua' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '20px 22px', borderRight: `1px solid ${inkFaint}`, borderBottom: `1px solid ${inkFaint}`,
              background: i % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent',
            }}>
              <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: s.v.length > 4 ? 28 : 38, lineHeight: 1, color: ink, letterSpacing: '-0.02em' }}>
                {s.v}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '0.22em', color: accent, marginTop: 8, fontWeight: 500 }}>
                {s.sub}
              </div>
              <div style={{ fontSize: 11.5, color: inkSub, marginTop: 4, lineHeight: 1.4 }}>
                {s.d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PatternTransporte, PatternMineria, PatternDefensa, PatternTelco, PatternEnergia, PatternSalud, ChileMap,
});
