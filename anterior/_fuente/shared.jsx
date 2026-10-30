// Shared primitives for all Andes Electrónica home variations
// Each variation imports nothing — they read window.* globals. Keep styles scoped.

// ─── Client logos (real images — white on transparent, intended for dark surfaces)
const __r = (id, fallback) => (window.__resources && window.__resources[id]) || fallback;

// Inject marquee keyframes + reveal stagger CSS once
if (typeof document !== 'undefined' && !document.getElementById('__clientlogos_css')) {
  const css = document.createElement('style');
  css.id = '__clientlogos_css';
  css.textContent = `
    @keyframes ae-marquee-x {
      from { transform: translate3d(0, 0, 0); }
      to   { transform: translate3d(-50%, 0, 0); }
    }
    .ae-marquee-wrap {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      /* fade edges so logos dissolve in/out of the strip */
      -webkit-mask-image: linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%);
              mask-image: linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%);
    }
    .ae-marquee-track {
      display: flex;
      width: max-content;
      align-items: center;
      will-change: transform;
      animation: ae-marquee-x 38s linear infinite;
    }
    .ae-marquee-wrap:hover .ae-marquee-track { animation-play-state: paused; }
    .ae-marquee-track > .ae-logo {
      opacity: 0;
      transform: translateX(14px);
      transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
                  transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ae-marquee-wrap.is-revealed .ae-marquee-track > .ae-logo {
      opacity: 0.72;
      transform: translateX(0);
    }
    .ae-marquee-track > .ae-logo:hover { opacity: 1 !important; }
  `;
  document.head.appendChild(css);
}

function ClientLogos({ color = 'rgba(232,228,220,0.55)', gap = 56, surface = 'dark' }) {
  const logos = [
    { name: 'Turbús',       src: __r('clientTurbus',      'assets/logos/clients/turbus.svg'),       h: 26 },
    { name: 'Cruz del Sur', src: __r('clientCruzDelSur', 'assets/logos/clients/cruz-del-sur.png'), h: 30 },
    { name: 'EFE',          src: __r('clientEfe',         'assets/logos/clients/efe.svg'),          h: 44 },
    { name: 'ETM',          src: __r('clientEtm',         'assets/logos/clients/etm.png'),          h: 26 },
    { name: 'Transantin',   src: __r('clientTransantin',  'assets/logos/clients/transantin.png'),   h: 34 },
    { name: 'Cormar',       src: 'assets/logos/clients/cormar.webp',                                 h: 18 },
  ];
  const filter = surface === 'light' ? 'invert(1) brightness(0.6)' : 'none';

  // Reveal-on-scroll trigger — kicks off the staggered fade-in once the strip
  // is actually in view, so users land on the section instead of catching the
  // tail end of an animation that already finished.
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { el.classList.add('is-revealed'); io.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Duplicate the list so the marquee loop is seamless (the track translates
  // by -50%, landing precisely on the start of the second copy).
  const loop = [...logos, ...logos];

  return (
    <div ref={wrapRef} className="ae-marquee-wrap">
      <div className="ae-marquee-track" style={{ gap }}>
        {loop.map((l, i) => (
          <img key={i} src={l.src} alt={i < logos.length ? l.name : ''} aria-hidden={i >= logos.length}
            className="ae-logo"
            style={{
              height: l.h, width: 'auto', objectFit: 'contain', filter, display: 'block',
              flexShrink: 0,
              // Stagger only the FIRST set of logos; the duplicate copies inherit
              // the revealed state instantly so the loop stays seamless.
              transitionDelay: i < logos.length ? `${i * 140}ms` : '0ms',
            }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Brand mark — real Andes Electrónica logo
// variant: 'white' (inverted BW for dark surfaces), 'colour' (navy for light surfaces),
//          'bw' (black for very light surfaces), or 'auto' (reads theme from color cue).
function AEMark({ size = 28, color, variant = 'auto', surface = 'dark' }) {
  let useVariant = variant;
  if (variant === 'auto') {
    useVariant = surface === 'light' ? 'colour' : 'white';
  }
  const src = useVariant === 'colour'
    ? __r('aeLogoColour', 'assets/logos/AE-logo-colour.svg')
    : __r('aeLogoBw',     'assets/logos/EA-logo-bw.svg');
  const filter = useVariant === 'white' ? 'invert(1)' : 'none';
  return (
    <img src={src} alt="Andes Electrónica"
      style={{ width: size, height: size, display: 'block', objectFit: 'contain', filter }} />
  );
}

// ─── Tacograph device illustration (schematic, not logo)
function TacoDevice({ w = 280, accent = '#c07d2e', stroke = '#e8e4dc' }) {
  return (
    <svg width={w} height={w * 0.62} viewBox="0 0 280 174" fill="none">
      <rect x="6" y="6" width="268" height="162" rx="4" stroke={stroke} strokeWidth="1" fill="none"/>
      <rect x="18" y="20" width="120" height="54" rx="2" fill={accent} fillOpacity="0.06" stroke={accent} strokeWidth="0.8"/>
      <text x="24" y="38" fill={accent} fontSize="10" fontFamily="ui-monospace,Menlo,monospace" letterSpacing="0.1em">● REC 07:42</text>
      <text x="24" y="56" fill={stroke} fontSize="18" fontFamily="ui-monospace,Menlo,monospace" fontWeight="700">078</text>
      <text x="66" y="56" fill={stroke} fontSize="9" fontFamily="ui-monospace,Menlo,monospace" opacity="0.6">km/h</text>
      <text x="24" y="70" fill={stroke} fontSize="8" opacity="0.5" fontFamily="ui-monospace,Menlo,monospace">GNSS · 11 SV · HDOP 0.8</text>
      {/* slot */}
      <rect x="150" y="20" width="112" height="30" rx="2" stroke={stroke} strokeWidth="0.8" fill="none" opacity="0.4"/>
      <text x="156" y="38" fill={stroke} fontSize="7" fontFamily="ui-monospace,Menlo,monospace" opacity="0.5">SMARTCARD · DRV-01</text>
      <rect x="155" y="40" width="18" height="6" fill={accent} fillOpacity="0.6"/>
      {/* buttons */}
      {[0,1,2,3].map(i => (
        <circle key={i} cx={164 + i*22} cy={66} r="4" stroke={stroke} strokeWidth="0.8" opacity="0.5" fill="none"/>
      ))}
      {/* waveform */}
      <path d="M18 104 L38 104 L44 96 L52 112 L60 100 L72 108 L88 90 L102 110 L120 98 L140 104 L156 104 L172 94 L188 110 L206 102 L224 106 L262 106"
        stroke={accent} strokeWidth="1" fill="none" opacity="0.7"/>
      {/* ruler */}
      <g opacity="0.4">
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={18 + i*10} y1="130" x2={18 + i*10} y2={i%4===0?'140':'136'} stroke={stroke} strokeWidth="0.6"/>
        ))}
      </g>
      <text x="18" y="156" fill={stroke} fontSize="7" fontFamily="ui-monospace,Menlo,monospace" opacity="0.5">04:00</text>
      <text x="118" y="156" fill={stroke} fontSize="7" fontFamily="ui-monospace,Menlo,monospace" opacity="0.5">10:00</text>
      <text x="218" y="156" fill={stroke} fontSize="7" fontFamily="ui-monospace,Menlo,monospace" opacity="0.5">16:00</text>
    </svg>
  );
}

// ─── Architecture diagram (compact)
function ArchDiagram({ accent = '#c07d2e', mono = 'ui-monospace,Menlo,monospace', stroke = 'rgba(232,228,220,0.3)', text = 'rgba(232,228,220,0.9)', muted = 'rgba(232,228,220,0.5)' }) {
  const nodes = [
    { x: 20, y: 80, label: 'VEHÍCULO', sub: 'Bus · Camión', icon: '◆' },
    { x: 180, y: 80, label: 'TACÓGRAFO 4.0', sub: 'GNSS · SmartCard · CAN', icon: '◉', primary: true },
    { x: 340, y: 80, label: 'PLATAFORMA SACEL', sub: 'Reportes DT · Cumplimiento', icon: '▣', primary: true },
    { x: 500, y: 80, label: 'DASHBOARD', sub: 'Flota · Infracciones · Mant.', icon: '▤' },
  ];
  return (
    <svg width="600" height="180" viewBox="0 0 600 180" style={{ width: '100%', height: 'auto', maxWidth: 600 }}>
      {/* grid */}
      <defs>
        <pattern id="archgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={stroke} strokeWidth="0.4" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="600" height="180" fill="url(#archgrid)"/>
      {/* connectors */}
      {nodes.slice(0,-1).map((n, i) => {
        const next = nodes[i+1];
        return (
          <g key={i}>
            <line x1={n.x + 110} y1={n.y + 30} x2={next.x} y2={next.y + 30} stroke={accent} strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
            <polygon points={`${next.x - 6},${next.y + 27} ${next.x},${next.y + 30} ${next.x - 6},${next.y + 33}`} fill={accent} opacity="0.6"/>
          </g>
        );
      })}
      {/* nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x} y={n.y} width="110" height="60"
            fill={n.primary ? 'rgba(192,125,46,0.08)' : 'rgba(232,228,220,0.03)'}
            stroke={n.primary ? accent : stroke} strokeWidth="1"/>
          <text x={n.x + 10} y={n.y + 18} fill={accent} fontSize="11" fontFamily={mono}>{n.icon}</text>
          <text x={n.x + 10} y={n.y + 34} fill={text} fontSize="8.5" fontFamily={mono} fontWeight="700" letterSpacing="0.05em">{n.label}</text>
          <text x={n.x + 10} y={n.y + 48} fill={muted} fontSize="7" fontFamily={mono} letterSpacing="0.04em">{n.sub}</text>
        </g>
      ))}
      {/* labels on arrows */}
      <text x={145} y={70} fill={muted} fontSize="6.5" fontFamily={mono} letterSpacing="0.08em">TELEMETRÍA</text>
      <text x={305} y={70} fill={muted} fontSize="6.5" fontFamily={mono} letterSpacing="0.08em">API SEGURA</text>
      <text x={465} y={70} fill={muted} fontSize="6.5" fontFamily={mono} letterSpacing="0.08em">REPORTES</text>
    </svg>
  );
}

// ─── Global animations + reusable keyframes used by Home and other pages.
//     Injected ONCE on first import — avoids per-component <style> blocks
//     duplicating keyframes when multiple variants render on the same page.
if (typeof document !== 'undefined' && !document.getElementById('__andes_global_anims')) {
  const css = document.createElement('style');
  css.id = '__andes_global_anims';
  css.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }
    @keyframes rotEnter {
      from { opacity: 0; transform: translateY(6px); filter: blur(3px); }
      to   { opacity: 1; transform: translateY(0);  filter: blur(0); }
    }
    @keyframes logoGlitchOut {
      0%   { opacity: 0.85; transform: scale(1.04) translate(0,0);    filter: saturate(0.85) contrast(1.05); }
      14%  { opacity: 0.4;  transform: scale(1.06) translate(-3px,1px); filter: saturate(0.4)  contrast(1.4)  hue-rotate(-12deg); }
      28%  { opacity: 0.7;  transform: scale(1.05) translate(2px,-2px); filter: saturate(0.6)  contrast(1.2); }
      42%  { opacity: 0.3;  transform: scale(1.08) translate(-2px,2px); filter: saturate(0.2)  contrast(1.6)  hue-rotate(8deg); }
      56%  { opacity: 0.5;  transform: scale(1.10) translate(1px,0px);  filter: saturate(0.5)  contrast(1.1); }
      70%  { opacity: 0.18; transform: scale(1.12) translate(-1px,-1px); filter: saturate(0.2) contrast(1.4); }
      100% { opacity: 0;    transform: scale(1.16) translate(0,0);     filter: saturate(0); }
    }
    @keyframes logoGlitchIn {
      0%   { opacity: 0;    transform: scale(0.55) translate(0,0); }
      14%  { opacity: 0.85; transform: scale(0.58) translate(2px,-1px); filter: hue-rotate(-8deg); }
      28%  { opacity: 0.4;  transform: scale(0.66) translate(-1px,2px); }
      42%  { opacity: 0.9;  transform: scale(0.72) translate(2px,0);    filter: hue-rotate(6deg); }
      56%  { opacity: 0.55; transform: scale(0.80) translate(-1px,-1px); }
      70%  { opacity: 0.95; transform: scale(0.88) translate(0,1px); }
      100% { opacity: 1;    transform: scale(0.92) translate(0,0);     filter: none; }
    }
    @keyframes ringPulse {
      0%, 100% { transform: scale(1);   opacity: 0.55; }
      50%      { transform: scale(1.10); opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes ringPulse {
        0%, 100% { transform: none; opacity: 1; }
        50%      { transform: none; opacity: 1; }
      }
    }

    /* ─── Responsive guards for the hero sphere background.
       The PNG is positioned with viewport-relative math tuned for ≥1100px wide
       layouts (the empty-left column it sits in shrinks as the text block hugs
       the right side). Below that, scale it down to keep proportion; below
       900px the empty zone effectively disappears, so hide it entirely so it
       doesn't crash through the headline. */
    @media (max-width: 1100px) {
      .hero-bg-image {
        background-size: 140vw auto !important;
        opacity: 0.55 !important;
      }
    }
    @media (max-width: 900px) {
      .hero-bg-image { display: none !important; }
    }
  `;
  document.head.appendChild(css);
}

Object.assign(window, { ClientLogos, AEMark, TacoDevice, ArchDiagram, StatsStrip, CountUp });

// ─── Stats strip — reused on Home AND Empresa pages.
// Each stat can be a static value or an interactive link (ISO 9001 → certificate
// page). Lives in shared so both pages stay in sync if values change. Pass the
// full `theme` object plus the page padding.
function StatsStrip({ theme, pad = 72 }) {
  const { p, copper, display } = theme;
  const ref = React.useRef(null);
  const [started, setStarted] = React.useState(false);
  // Canonical 4 facts about the company. To add a 5th stat update gridTemplateColumns below.
  const stats = [
    { label: 'Operación continua en Chile desde 1991', staticVal: '+30 años' },
    { label: 'Certificación de calidad vigente',        staticVal: 'ISO 9001',       href: './ISO-9001.html' },
    { label: 'Operador SACEL autorizado (2 feb 2009)',  staticVal: 'Res. DT N°139' },
    { label: 'Ingeniería, fabricación y soporte local', staticVal: 'Empresa Chilena' },
  ];

  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && !started) { setStarted(true); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [started]);

  return (
    <section ref={ref} style={{ background: p.surface, padding: `52px ${pad}px`, borderTop: `1px solid ${copper}55`, borderBottom: `1px solid ${p.inkFaint}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 36 }}>
        {stats.map((s, i) => {
          // Each stat is interactive when it has an href — promotes the item to
          // a real link with a subtle hover reaction (copper shift on the value,
          // tiny lift, copper underline cue + arrow). Non-linked stats stay
          // visually identical to a plain div.
          const inner = (
            <React.Fragment>
              <div className="stat-value" style={{ ...display, fontSize: 44, lineHeight: 1, color: p.ink, letterSpacing: '-0.035em', fontWeight: 600, fontVariantNumeric: 'tabular-nums', transition: 'color .25s ease, transform .25s ease', display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
                {s.staticVal}
                {s.href && (
                  <span aria-hidden="true" className="stat-arrow" style={{ ...display, fontSize: 22, color: copper, opacity: 0, transform: 'translateX(-6px)', transition: 'opacity .25s ease, transform .25s ease' }}>→</span>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 13.5, color: p.inkSub, lineHeight: 1.5, maxWidth: 230, opacity: 0.88 }}>{s.label}</div>
              {s.href && (
                <div className="stat-cue" style={{ marginTop: 14, height: 1, width: 28, background: copper, opacity: 0.4, transition: 'width .35s ease, opacity .25s ease' }}/>
              )}
            </React.Fragment>
          );
          const cellStyle = {
            borderLeft: i === 0 ? 'none' : `1px solid ${p.inkFaint}`,
            paddingLeft: i === 0 ? 0 : 36,
          };
          if (s.href) {
            return (
              <a key={i} href={s.href} className="stat-link" style={{
                ...cellStyle,
                display: 'block', textDecoration: 'none', color: 'inherit',
                cursor: 'pointer', position: 'relative',
                transition: 'transform .25s ease',
              }}>{inner}</a>
            );
          }
          return <div key={i} style={cellStyle}>{inner}</div>;
        })}
      </div>
      <style>{`
        .stat-link:hover .stat-value { color: ${copper}; transform: translateY(-1px); }
        .stat-link:hover .stat-arrow { opacity: 1; transform: translateX(0); }
        .stat-link:hover .stat-cue   { width: 64px; opacity: 1; }
        .stat-link:focus-visible { outline: 1px solid ${copper}; outline-offset: 6px; }
      `}</style>
    </section>
  );
}

// ─── Generic count-up — kept here so any future stat can opt in by passing a numeric target.
function CountUp({ to, start, suffix = '', duration = 1800 }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!start || to == null) return;
    let raf; const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      setN(Math.round(ease(p) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to, duration]);
  return <>{n.toLocaleString('es-CL')}{suffix}</>;
}
