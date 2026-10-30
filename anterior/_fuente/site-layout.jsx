// Shared layout + theme system for Andes Electrónica site
// Includes: palette/accent/typeface resolvers, GridOverlay, TopNav, SiteFooter

// ─── Resolve theme from props (matches V2DeepTeal)
function resolveTheme({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const palettes = {
    'deep-teal': { bg: `radial-gradient(ellipse 140% 90% at 85% -10%, #144e72 0%, #0a2638 38%, #05131f 100%)`, surface: '#07202f', surface2: '#08202f', deep: '#04101a', ink: '#e8e4dc', inkSub: 'rgba(232,228,220,0.72)', inkDim: 'rgba(232,228,220,0.5)', inkFaint: 'rgba(232,228,220,0.08)', onAccent: '#0a1a26', navBg: 'rgba(5,19,31,0.85)' },
    'near-black': { bg: `radial-gradient(ellipse 140% 90% at 85% -10%, #1a1f2a 0%, #0c0f16 40%, #05070c 100%)`, surface: '#0e1218', surface2: '#0a0d13', deep: '#03050a', ink: '#ece9e4', inkSub: 'rgba(236,233,228,0.72)', inkDim: 'rgba(236,233,228,0.5)', inkFaint: 'rgba(236,233,228,0.08)', onAccent: '#0a0d13', navBg: 'rgba(5,7,12,0.85)' },
    'light': { bg: `radial-gradient(ellipse 140% 90% at 85% -10%, #f5f2ed 0%, #ebe7de 50%, #dfd9cb 100%)`, surface: '#ffffff', surface2: '#f5f2ed', deep: '#ebe7de', ink: '#0c3d5c', inkSub: 'rgba(12,61,92,0.75)', inkDim: 'rgba(12,61,92,0.55)', inkFaint: 'rgba(12,61,92,0.12)', onAccent: '#0c3d5c', navBg: 'rgba(245,242,237,0.88)' },
  };
  // DS spec: copper #c07d2e (primary), warm #d4893a (hover), muted/pressed #a86922
  const accents = { copper: '#c07d2e', warm: '#d4893a', muted: '#a86922' };
  // DS spec: DM Serif Display (editorial display) + DM Sans (body) is canonical;
  // Space Grotesk is the technical-display alt; Inter kept for legacy compatibility.
  const fontStacks = {
    inter: { display: '"DM Serif Display", Georgia, "Times New Roman", serif', displayWeight: 400, displayTrack: '-0.02em', body: '"DM Sans", "Helvetica Neue", Arial, sans-serif' },
    grotesk: { display: '"Space Grotesk", "DM Sans", sans-serif', displayWeight: 600, displayTrack: '-0.03em', body: '"DM Sans", "Helvetica Neue", Arial, sans-serif' },
    mixed: { display: '"DM Serif Display", Georgia, serif', displayWeight: 400, displayTrack: '-0.02em', body: '"DM Sans", "Helvetica Neue", Arial, sans-serif' },
  };
  const p = palettes[palette] || palettes['deep-teal'];
  const copper = accents[accent] || accents.copper;
  const fs = fontStacks[typeface] || fontStacks.inter;
  // Copper hover/pressed derived from active accent
  const accentWarm = accent === 'copper' ? '#d4893a' : accent === 'muted' ? '#c07d2e' : '#e89c4f';
  const accentPressed = accent === 'copper' ? '#a86922' : accent === 'muted' ? '#8a5a1f' : '#b8722a';
  const accentSoft = `${copper}1a`; // ~0.10 alpha
  const accentGlow = `${copper}38`; // ~0.22 alpha

  return {
    p, copper, accentWarm, accentPressed, accentSoft, accentGlow,
    palette, accent, typeface,
    display: { fontFamily: fs.display, fontWeight: fs.displayWeight, letterSpacing: fs.displayTrack },
    displayEditorial: { fontFamily: '"DM Serif Display", Georgia, serif', fontWeight: 400, letterSpacing: '-0.02em' },
    mono: { fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace' },
    body: { fontFamily: fs.body },
    // DS motion tokens
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    durQuick: '130ms',
    durBase: '180ms',
    durSlow: '260ms',
    durReveal: '900ms',
    // DS shadow tokens (tuned for both light + dark surfaces)
    shadowCard: palette === 'light'
      ? '0 1px 3px rgba(28,25,23,0.07), 0 4px 12px rgba(28,25,23,0.04)'
      : '0 1px 3px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.25)',
    shadowHover: palette === 'light'
      ? '0 4px 8px rgba(28,25,23,0.08), 0 12px 28px rgba(28,25,23,0.10)'
      : '0 4px 8px rgba(0,0,0,0.45), 0 12px 28px rgba(0,0,0,0.40)',
    shadowCTA: `0 4px 18px ${accentGlow}, 0 1px 3px rgba(0,0,0,0.2)`,
    shadowCTAHover: `0 6px 28px rgba(192,125,46,0.38), 0 2px 6px rgba(0,0,0,0.2)`,
    // DS radius tokens
    rXs: 3, rSm: 4, rMd: 6, rLg: 8, rPill: 999,
  };
}

// ─── Persistent grid overlay — stronger at top, fades down
function GridOverlay({ palette = 'deep-teal' }) {
  const line = palette === 'light' ? 'rgba(12,61,92,0.10)' : 'rgba(232,228,220,0.07)';
  const lineFaint = palette === 'light' ? 'rgba(12,61,92,0.05)' : 'rgba(232,228,220,0.035)';
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px), linear-gradient(${lineFaint} 1px, transparent 1px), linear-gradient(90deg, ${lineFaint} 1px, transparent 1px)`,
      backgroundSize: '128px 128px, 128px 128px, 32px 32px, 32px 32px',
      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.08) 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.08) 100%)',
    }}/>
  );
}

// ─── Top navigation
function TopNav({ theme, current, pad = 72 }) {
  const { p, copper, accentWarm, display, mono, body, ease, durBase, durQuick, shadowCTA, shadowCTAHover, shadowHover, rPill, rSm } = theme;
  const [openMenu, setOpenMenu] = React.useState(null);

  // Close on outside click / Esc
  React.useEffect(() => {
    if (!openMenu) return;
    const onDoc = (e) => {
      if (!e.target.closest('[data-nav-dropdown]')) setOpenMenu(null);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, [openMenu]);

  const links = [
    {
      id: 'productos',
      label: 'Productos',
      href: './Productos.html',
      children: [
        { label: 'Sistema SACEL', sub: 'Plataforma de gestión de flota', href: './Sistema-SACEL.html' },
        { label: 'Tacógrafo 4.0', sub: 'Registro certificado de conducción', href: './Tacografo-4.0.html' },
        { label: 'Visor VI7GPS', sub: 'Display dual de velocidad', href: './Visor-VI7GPS.html' },
        { label: 'Otros productos', sub: 'Catálogo de equipos complementarios', href: './Otros-Productos.html' },
      ],
    },
    { id: 'servicios', label: 'Servicios', href: './Servicios.html' },
    { id: 'industrias', label: 'Industrias', href: './Industrias.html' },
    { id: 'investigacion', label: 'I+D', href: './Investigacion-Desarrollo.html' },
    {
      id: 'empresa',
      label: 'Empresa',
      href: './Empresa.html',
      children: [
        { label: 'Quiénes somos', sub: 'Historia, equipo y oficina central', href: './Empresa.html' },
        { label: 'ISO 9001', sub: 'Certificación de calidad vigente', href: './ISO-9001.html' },
      ],
    },
  ];

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `22px ${pad}px`, borderBottom: `1px solid ${p.inkFaint}`, position: 'sticky', top: 0, zIndex: 40, background: p.navBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <a href="./index.html" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: p.ink }}>
        <AEMark size={66} surface={theme.palette === 'light' ? 'light' : 'dark'}/>
        <div>
          <div style={{ ...display, fontSize: 20, fontWeight: 400, letterSpacing: '-0.02em' }}>Andes Electrónica</div>
          <div style={{ ...mono, fontSize: 8, letterSpacing: '0.22em', color: p.inkDim, textTransform: 'uppercase', marginTop: 3 }}>Est. 1991 · Santiago, Chile</div>
        </div>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 16, fontWeight: 500, ...body }}>
        {links.map(l => {
          if (l.children) {
            const isOpen = openMenu === l.id;
            return (
              <div key={l.id}
                data-nav-dropdown
                onMouseEnter={() => setOpenMenu(l.id)}
                onMouseLeave={() => setOpenMenu(null)}
                style={{ position: 'relative' }}>
                <a href={l.href}
                  className="andes-nav-link"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  aria-current={current === l.id ? 'page' : undefined}
                  style={{
                    color: current === l.id ? p.ink : p.inkSub,
                    textDecoration: 'none',
                    position: 'relative',
                    paddingBottom: 4,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: `color ${durBase} ${ease}`,
                  }}>
                  {l.label}
                  <span aria-hidden="true" style={{
                    display: 'inline-block',
                    fontSize: 10, lineHeight: 1,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: `transform ${durBase} ${ease}`,
                  }}>▾</span>
                  <span aria-hidden="true" style={{
                    position: 'absolute', left: 0, bottom: 0, width: '100%', height: 2,
                    background: copper,
                    transformOrigin: 'left center',
                    transform: current === l.id || isOpen ? 'scaleX(1)' : 'scaleX(0)',
                    transition: `transform ${durBase} ${ease}`,
                  }}/>
                </a>
                {/* invisible bridge so hover doesn't drop between trigger and panel */}
                <div aria-hidden="true" style={{ position: 'absolute', top: '100%', left: 0, right: 0, height: 14 }}/>
                <div
                  role="menu"
                  style={{
                    position: 'absolute', top: 'calc(100% + 14px)', left: 0,
                    minWidth: 320,
                    background: p.surface,
                    border: `1px solid ${p.inkFaint}`,
                    borderTop: `2px solid ${copper}`,
                    boxShadow: shadowHover,
                    padding: 6,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
                    transition: `opacity ${durBase} ${ease}, transform ${durBase} ${ease}, visibility 0s linear ${isOpen ? '0s' : durBase}`,
                    zIndex: 41,
                  }}>
                  {l.children.map(c => (
                    <a key={c.label} href={c.href} role="menuitem"
                      className="andes-dropdown-item"
                      style={{
                        display: 'block',
                        padding: '14px 16px',
                        textDecoration: 'none',
                        color: p.ink,
                        borderRadius: rSm,
                        transition: `background ${durQuick} ${ease}, padding-left ${durBase} ${ease}`,
                      }}>
                      <div style={{ ...display, fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{c.label}</div>
                      <div style={{ fontSize: 13, color: p.inkSub, marginTop: 2 }}>{c.sub}</div>
                    </a>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <a key={l.id} href={l.href}
              data-active={current === l.id ? '1' : '0'}
              aria-current={current === l.id ? 'page' : undefined}
              className="andes-nav-link"
              style={{
                color: current === l.id ? p.ink : p.inkSub,
                textDecoration: 'none',
                position: 'relative',
                paddingBottom: 4,
                transition: `color ${durBase} ${ease}`,
              }}>
              {l.label}
              <span aria-hidden="true" style={{
                position: 'absolute', left: 0, bottom: 0, width: '100%', height: 2,
                background: copper,
                transformOrigin: 'left center',
                transform: current === l.id ? 'scaleX(1)' : 'scaleX(0)',
                transition: `transform ${durBase} ${ease}`,
              }}/>
            </a>
          );
        })}
        <a href="./Contacto.html"
          className="andes-cta"
          style={{
            background: copper, color: p.onAccent,
            border: `1px solid ${copper}`,
            padding: '11px 22px', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em',
            textDecoration: 'none', borderRadius: rPill,
            boxShadow: shadowCTA,
            transition: `background ${durBase} ${ease}, box-shadow ${durBase} ${ease}, transform ${durBase} ${ease}`,
          }}>
          Contacto →
        </a>
      </div>
      <style>{`
        .andes-nav-link:hover { color: ${copper} !important; }
        .andes-nav-link:hover > span:last-child { transform: scaleX(1) !important; }
        .andes-cta:hover { background: ${accentWarm} !important; box-shadow: ${shadowCTAHover} !important; transform: translateY(-2px); }
        .andes-dropdown-item:hover { background: ${p.surface2 || `${copper}14`} !important; padding-left: 22px !important; }
      `}</style>
    </nav>
  );
}

// ─── Site footer — DS spec: vertical gradient + top-edge copper line, copper-stripe hover on links
function SiteFooter({ theme, pad = 72 }) {
  const { p, copper, display, mono, ease, durBase } = theme;
  const isLight = theme.palette === 'light';
  const footerBg = isLight
    ? p.deep
    : `linear-gradient(180deg, ${p.surface2 || p.deep} 0%, ${p.deep} 100%)`;
  return (
    <footer style={{ background: footerBg, padding: `60px ${pad}px 32px`, color: p.inkSub, position: 'relative', zIndex: 2 }}>
      {/* DS signature: copper gradient top edge */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${copper}, transparent)` }}/>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, paddingBottom: 40, borderBottom: `1px solid ${p.inkFaint}` }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <AEMark size={28} surface={isLight ? 'light' : 'dark'}/>
            <div style={{ ...display, fontSize: 22, color: p.ink, fontWeight: 400 }}>Andes Electrónica</div>
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, maxWidth: 360 }}>
            Desde 1991 desarrollamos productos y servicios electrónicos de alta calidad para transporte, minería, defensa y telecomunicaciones.
          </p>
          <div style={{ marginTop: 20, ...mono, fontSize: 12, letterSpacing: '0.12em', color: p.inkDim }}>
            ISO 9001 · Cert. DT N°139/2009
          </div>
        </div>
        {[
          ['Productos', [
            ['Sistema SACEL', './Sistema-SACEL.html'],
            ['Tacógrafo 4.0', './Tacografo-4.0.html'],
            ['Visor VI7GPS', './Visor-VI7GPS.html'],
            ['Otros productos', './Otros-Productos.html'],
          ]],
          ['Servicios', [
            ['Instalaciones', './Servicios.html'],
            ['Servicio técnico', './Servicios.html'],
            ['Diseño & fabricación', './Servicios.html'],
            ['I+D', './Investigacion-Desarrollo.html'],
          ]],
          ['Empresa', [
            ['Quiénes somos', './Empresa.html'],
            ['ISO 9001', './ISO-9001.html'],
            ['Industrias', './Industrias.html'],
            ['Privacidad', './Privacidad.html'],
            ['Contacto', './Contacto.html'],
          ]],
        ].map(([h, items]) => (
          <div key={h}>
            <div style={{ ...mono, fontSize: 12, letterSpacing: '0.18em', color: copper, textTransform: 'uppercase', marginBottom: 16 }}>{h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15 }}>
              {items.map(([lbl, href]) => (
                <a key={lbl} href={href}
                  className="andes-footer-link"
                  style={{
                    color: p.inkSub, textDecoration: 'none',
                    paddingLeft: 0,
                    transition: `color ${durBase} ${ease}, padding-left ${durBase} ${ease}`,
                  }}>{lbl}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, ...mono, fontSize: 12, letterSpacing: '0.1em', color: p.inkDim }}>
        <span>© 2026 Andes Electrónica S.A. (Enrique Morchio y Cía. Ltda.) · Santiago, Chile</span>
        <span>contacto@andeselec.com · +56 2 23478700</span>
      </div>
      <style>{`
        .andes-footer-link:hover { color: ${p.ink} !important; padding-left: 6px !important; }
      `}</style>
    </footer>
  );
}

Object.assign(window, { resolveTheme, GridOverlay, TopNav, SiteFooter, readSharedTweaks, applyBodyBg });

// ─── Read tweaks persisted in localStorage (set by Home). Defaults match Home's defaults.
function readSharedTweaks(defaults = { palette: 'deep-teal', accent: 'copper', typeface: 'inter', density: 'comfortable' }) {
  try {
    const raw = localStorage.getItem('andes-tweaks');
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch { return defaults; }
}

// ─── Apply the active palette's base color to html+body so areas outside <root>
//     (and any browser overscroll) match the page surface.
function applyBodyBg(theme) {
  const baseBgColor = {
    'deep-teal': '#05131f',
    'near-black': '#05070c',
    'light': '#dfd9cb',
  }[theme.palette] || '#05131f';
  document.documentElement.style.background = baseBgColor;
  document.body.style.background = baseBgColor;
}
