// ANDES ELECTRÓNICA — Deep Teal Editorial (Palantir-style modern typography)
// Inter tight tracking, no serifs on display headings.

// ─── RotatingSpan: brief build-up animation through variants. Settles on the last value.
//             Use for momentary attention without disrupting reading.
function RotatingSpan({ variants, delay = 0, interval = 650, color }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    let cancelled = false;
    const timers = [];
    variants.forEach((_, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => {
        if (!cancelled) setIdx(i);
      }, delay + interval * i));
    });
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, []);
  return (
    <span style={{ color }}>
      <span key={idx} style={{
        display: 'inline-block',
        animation: 'rotEnter .42s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>{variants[idx]}</span>
    </span>
  );
}

function V2DeepTeal({ density = 'comfortable', palette = 'deep-teal', typeface = 'inter', accent = 'copper' }) {
  const pad = density === 'compact' ? 40 : 72;
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const ink = p.ink;
  const [activeTab, setActiveTab] = React.useState(0);
  const [liveCount, setLiveCount] = React.useState(1847);

  // Drive activeTab from scroll progress through the products section
  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = productsRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const travel = Math.max(1, rect.height - vh);
        const t = Math.max(0, Math.min(1, -rect.top / travel));
        // 0 → .35 Tacógrafo · .35 → .68 Visor · .68 → 1 SACEL
        // Small hysteresis so the value doesn't flicker exactly on a threshold
        const next = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
        setActiveTab(prev => prev === next ? prev : next);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  React.useEffect(() => {
    const t = setInterval(() => setLiveCount(c => 1840 + Math.floor(Math.random() * 20)), 2600);
    return () => clearInterval(t);
  }, []);

  // Floating logo state
  const floatRef = React.useRef(null);
  const productsRef = React.useRef(null);

  // Logo transition: 0 = historic only, 1 = glitching crossover, 2 = modern only.
  // Triggers on the SECOND distinct downward scroll gesture (so the user sees the
  // historic logo on landing, then "wakes" the transition the next time they engage).
  const [logoPhase, setLogoPhase] = React.useState(0);
  React.useEffect(() => {
    let gestures = 0;
    let lastScrollTime = 0;
    let lastY = window.scrollY;
    let triggered = false;
    let phase1Timer = 0, phase2Timer = 0;
    const GESTURE_GAP = 280; // ms — gaps larger than this count as a new gesture

    const onScroll = () => {
      if (triggered) return;
      const y = window.scrollY;
      const isDown = y > lastY;
      lastY = y;
      if (!isDown) return;
      const now = performance.now();
      if (now - lastScrollTime > GESTURE_GAP) {
        gestures += 1;
        if (gestures >= 2) {
          triggered = true;
          window.removeEventListener('scroll', onScroll);
          // Run the glitch transition now
          phase1Timer = setTimeout(() => setLogoPhase(1), 0);
          phase2Timer = setTimeout(() => setLogoPhase(2), 900);
        }
      }
      lastScrollTime = now;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (phase1Timer) clearTimeout(phase1Timer);
      if (phase2Timer) clearTimeout(phase2Timer);
    };
  }, []);

  const updateFloatStyles = React.useCallback(() => {
    if (!floatRef.current) return;
    const y = window.scrollY;
    // Parallax: drift up gently as user scrolls
    const offset = y * 0.18;
    // Aggressive scroll fade: starts immediately, fully transparent by ~70vh.
    const vh = window.innerHeight;
    const fadeDist = vh * 0.7;
    const rawT = y / fadeDist;
    const scrollOpacity = Math.max(0, Math.min(0.85, 0.85 - rawT * 0.85));
    floatRef.current.style.transform = `translateY(-${offset}px)`;
    floatRef.current.style.opacity = scrollOpacity;
  }, []);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateFloatStyles();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateFloatStyles();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [updateFloatStyles]);

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: p.bg,
      // Lock the gradient to the viewport so it stays in lockstep with the
      // fixed-position hero PNG below. Without this, the gradient scrolls
      // with the document while the PNG stays glued to the viewport — you
      // see a subtle "drift" where two backgrounds slowly desync.
      backgroundAttachment: 'fixed',
      color: ink, ...body,
      position: 'relative',
    }}>
      <GridOverlay palette={palette}/>
      <TopNav theme={theme} current="home" pad={pad}/>

      {/* ─── HERO ─── */}
      {/* SignalFlow at top, content tight below — no forced 100vh, no auto-margin
          gap. Section is exactly as tall as its content. */}
      <section style={{ padding: `40px ${pad}px 64px`, position: 'relative', zIndex: 1 }}>

        {/* Signal-flow schematic — lead visual, full-width. */}
        <SignalFlow theme={theme} palette={palette}/>

        <div style={{ position: 'relative', maxWidth: 820, marginLeft: 'auto', marginTop: 56 }}>
          {/* Institutional eyebrow */}
          <div style={{ ...mono, fontSize: 13, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', fontWeight: 500, marginBottom: 32 }}>
            — Andes Electrónica · Santiago de Chile · Est. 1991
          </div>
          <h1 style={{ margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.025em', fontWeight: 600 }}>
            Treinta años de <span style={{ color: copper }}>electrónica chilena</span> — diseñada en casa, renovada en cada generación.
          </h1>
          {/* Editorial rule under headline */}
          <div style={{ marginTop: 36, height: 1, width: 96, background: copper }}/>
          <p style={{ margin: '28px 0 0', fontSize: 21, lineHeight: 1.55, color: p.inkSub, maxWidth: 620, fontWeight: 400 }}>
            Diseñamos, fabricamos y mantenemos electrónica para <RotatingSpan
              delay={400}
              interval={500}
              color={ink}
              variants={[
                'transporte',
                'transporte y minería',
                'transporte, minería, telecomunicaciones, defensa e industria',
              ]}
            />. Tacógrafos y SACEL son la vitrina — atrás, <RotatingSpan
              delay={2400}
              interval={500}
              color={ink}
              variants={['+30 años', 'desde 1991', 'tres décadas']}
            /> de <RotatingSpan
              delay={4200}
              interval={500}
              color={ink}
              variants={[
                'PCBs',
                'PCBs y firmware',
                'PCBs, firmware y soluciones a medida',
              ]}
            /> que evolucionan con cada nueva tecnología.
          </p>
          {/* Credenciales line — institutional stamp */}
          <div style={{ marginTop: 32, ...mono, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.inkDim, fontWeight: 500 }}>
            ISO 9001 &nbsp;·&nbsp; Res. DT N°139/2009 &nbsp;·&nbsp; Res. Exenta N°1081 — DT
          </div>
          {/* Discrete CTAs — underlined links */}
          <div style={{ marginTop: 44, display: 'flex', gap: 36, alignItems: 'center', fontSize: 17, fontWeight: 500 }}>
            <a href="./Productos.html" style={{ color: ink, textDecoration: 'none', borderBottom: `1px solid ${copper}`, paddingBottom: 6, transition: `color ${theme.durBase} ${theme.ease}` }}>
              Catálogo de productos →
            </a>
            <a href="./Empresa.html" style={{ color: p.inkSub, textDecoration: 'none', borderBottom: `1px solid ${p.inkFaint}`, paddingBottom: 6 }}>
              Quiénes somos
            </a>
          </div>
        </div>
      </section>

      {/* ─── HERO ambient background — fixed-position, full-viewport.
            Two variants:
              • dark palettes → photographic sphere image (assets/hero/andes-sphere-bg.png)
              • light palette → editorial SVG composition (rings + topographic contours +
                copper-tinted sphere) tuned for warm cream surface; the photo would wash
                out and clash with the high-key background here.
            Both variants scroll-fade aggressively (opacity bound to scrollY via floatRef)
            and live in the same empty-left zone (sphere center = 50vw − (820+pad)/2). ─── */}
      {palette !== 'light' ? (
        <div ref={floatRef}
          aria-hidden="true"
          className="hero-bg-image"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: "url('assets/hero/andes-sphere-bg.png')",
            // Lock the image's WIDTH to viewport width so the sphere's horizontal
            // position inside the image is predictable (22% of image width = 22vw).
            // Then shift via calc() so the sphere center lands at the midpoint of
            // the empty-left column (between viewport edge and hero text block).
            //
            // Hero text block: maxWidth 820px, margin-left: auto, section pad: ${pad}px.
            // → text left edge   = 100vw - ${pad}px - 820px
            // → empty-zone center = (100vw - ${pad}px - 820px) / 2 = 50vw - ${(820 + pad)/2}px
            // Sphere lives at 22% of image width (= 22vw with size: 100vw auto), so:
            //   background-position-x = empty-zone-center - 22vw
            //                         = (50vw - ${(820 + pad)/2}px) - 22vw
            //                         = 28vw - ${(820 + pad)/2}px
            backgroundSize: '100vw auto',
            backgroundPosition: `calc(28vw - ${(820 + pad) / 2}px) 50%`,
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.85,
            willChange: 'opacity, transform',
            // Dual-gradient mask: fade out to the right (so image dissolves before it
            // reaches the headline column) and to the bottom (so it blends into the
            // page bg as the next section approaches). Composited with `intersect`
            // so both fades apply simultaneously.
            WebkitMaskImage:
              'linear-gradient(to right, black 0%, black 42%, rgba(0,0,0,0.4) 70%, transparent 92%),' +
              'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.35) 82%, transparent 100%)',
            WebkitMaskComposite: 'source-in',
            maskImage:
              'linear-gradient(to right, black 0%, black 42%, rgba(0,0,0,0.4) 70%, transparent 92%),' +
              'linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.35) 82%, transparent 100%)',
            maskComposite: 'intersect',
          }}/>
      ) : (
        <HeroBgLight floatRef={floatRef} pad={pad} copper={copper}/>
      )}

      {/* ─── PRODUCTS (tabs, interactive) ─── */}
      <section ref={productsRef} data-products-section style={{ padding: `60px ${pad}px 160px`, minHeight: '300vh' }}>
        {/* sticky panel — keeps section title + tabs + visual in view while user scrolls the tall section.
            top: 120px clears the TopNav (logo 66 + padding 22+22 ≈ 110px) so the panel
            never sits behind the nav. Title block is INSIDE the sticky container so
            "Productos destacados —" + headline remain visible throughout the freeze.
            To dim the rising grid lines by ~50% without showing a visible "plate" of
            color, we paint the LOCAL body-gradient color at 50% alpha (matches the
            outer stops of the radial gradient: #05131f dark / #dfd9cb light at this
            depth). Because the overlay color ≈ the bg color underneath, the gradient
            reads continuous; but anything painted ON TOP of the gradient (the grid
            lines) gets halved. No borders, no blur — the section stays continuous
            with what's above and below. */}
        <div style={{
          position: 'sticky',
          top: 120,
          background: palette === 'light' ? 'rgba(223,217,203,0.5)' : 'rgba(5,19,31,0.5)',
          padding: `36px ${pad}px 44px`,
          margin: `0 -${pad}px`,
        }}>
        <div style={{ marginBottom: 32, maxWidth: 860, marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ ...mono, fontSize: 13, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', fontWeight: 500, marginBottom: 14 }}>Productos destacados —</div>
          <h2 style={{ margin: 0, ...display, fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.035em' }}>
            Hardware nuestro, firmware nuestro,
            <span style={{ color: copper }}> soporte en español.</span>
          </h2>
        </div>

        {/* tab nav */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${p.inkFaint}`, marginBottom: 40 }}>
          {[
            { num: '01', label: 'Tacógrafo 4.0',          sub: 'Producto' },
            { num: '02', label: 'Sistema SACEL',           sub: 'Plataforma' },
            { num: '03', label: 'I+D & Software',          sub: 'A medida' },
            // ── RESERVED slot — hidden until project content arrives. To expose, remove the
            //    `reserved: true` flag and add the matching `activeTab === 3` content block below.
            { num: '04', label: 'Proyecto en desarrollo',  sub: 'Próximamente', reserved: true },
          ].filter(t => !t.reserved).map((t, i) => (
            <button key={i} onClick={() => {
              // Click to jump: scroll to the section offset that corresponds to this tab
              const el = productsRef.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const vh = window.innerHeight;
              const travel = Math.max(1, rect.height - vh);
              const targetT = i === 0 ? 0.05 : i === 1 ? 0.45 : 0.78;
              const targetTop = window.scrollY + rect.top + targetT * travel;
              window.scrollTo({ top: targetTop, behavior: 'smooth' });
            }} style={{
              flex: 1, padding: '22px 24px', background: 'transparent', border: 'none',
              borderBottom: activeTab === i ? `2px solid ${copper}` : '2px solid transparent',
              color: activeTab === i ? ink : `${p.inkDim}`,
              textAlign: 'left', cursor: 'pointer', transition: 'all .2s',
            }}>
              <div style={{ ...mono, fontSize: 12, letterSpacing: '0.2em', color: activeTab === i ? copper : `${p.inkDim}` }}>{t.num} — {t.sub.toUpperCase()}</div>
              <div style={{ ...display, fontSize: 26, marginTop: 8, fontWeight: 500, letterSpacing: '-0.02em' }}>{t.label}</div>
            </button>
          ))}
        </div>

        {/* tab content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          <div key={`tab-${activeTab}`} style={{ animation: 'tabFadeIn .5s ease both' }}>
            {activeTab === 0 && (
              <div>
                <h3 style={{ margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: '-0.035em' }}>
                  Tacógrafo 4.0 — el registro que<br/>la autoridad exige, y más.
                </h3>

                {/* Brief product tag */}
                <div style={{
                  marginTop: 20,
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  ...mono, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: copper, fontWeight: 600,
                }}>
                  <span style={{ width: 28, height: 1, background: copper }}/>
                  Tacógrafo digital certificado · Producto Andes
                </div>

                <p style={{ marginTop: 24, fontSize: 19, lineHeight: 1.55, color: `${p.inkSub}` }}>
                  Caja negra certificada bajo Res. Exenta N°1081 — DT. Conexión CAN 2.0B al bus del vehículo, GNSS + 4G dual, 24 meses de memoria interna e identificación por SmartCard, todo en carcasa grado IP54. Diseñada, fabricada y soportada en Santiago.
                </p>

                {/* Specs card */}
                <div style={{
                  marginTop: 32,
                  border: `1px solid ${p.inkFaint}`,
                  borderTop: `2px solid ${copper}`,
                  background: `${p.inkFaint}`,
                  padding: '22px 24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                    <div style={{ ...mono, fontSize: 11, letterSpacing: '0.22em', color: copper, textTransform: 'uppercase', fontWeight: 600 }}>Specs</div>
                    <div style={{ ...mono, fontSize: 10, letterSpacing: '0.14em', color: `${p.inkDim}` }}>AE-T40 · REV 2.4</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 28, rowGap: 10 }}>
                    {[
                      ['Certificación',  'Res. Exenta N°1081 — DT'],
                      ['Bus del vehículo','CAN 2.0B'],
                      ['Protección',     'IP54'],
                      ['Comunicaciones', '4G + GNSS dual'],
                      ['Memoria',        '24 meses'],
                      ['SmartCard',      'Conductor + Empresa'],
                    ].map(([k, v]) => (
                      <div key={k} style={{
                        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                        gap: 8, fontSize: 13.5,
                        borderBottom: `1px dashed ${p.inkFaint}`,
                        paddingBottom: 8,
                      }}>
                        <span style={{ ...mono, color: `${p.inkDim}`, letterSpacing: '0.04em', fontSize: 11.5, textTransform: 'uppercase' }}>{k}</span>
                        <span style={{ color: ink, fontWeight: 500, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a href="./Tacografo-4.0.html" style={{ marginTop: 32, display: 'inline-block', color: copper, fontSize: 16, fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${copper}`, paddingBottom: 4 }}>
                  Ver ficha técnica completa →
                </a>
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <h3 style={{ margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: '-0.035em' }}>
                  Sistema SACEL — del vehículo<br/>al reporte, en una plataforma.
                </h3>
                <p style={{ marginTop: 24, fontSize: 19, lineHeight: 1.6, color: `${p.inkSub}` }}>
                  Plataforma web para flotas con control de art. 25 del Código del Trabajo, bitácora de conductor, detección automática de infracciones y mantenciones programadas. Operador certificado por la Dirección del Trabajo.
                </p>
                <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, borderTop: `1px solid ${p.inkFaint}`, paddingTop: 24 }}>
                  {[
                    ['Conductores monitoreados', '12.4k'],
                    ['Seguimiento GPS · día',    '2.8M'],
                    ['Multas e informes · mes',  '8.500'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ ...mono, fontSize: 12, color: `${p.inkDim}`, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{k}</div>
                      <div style={{ ...display, fontSize: 40, color: ink, marginTop: 6, letterSpacing: '-0.03em' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <a href="./Sistema-SACEL.html" style={{ marginTop: 36, display: 'inline-block', color: copper, fontSize: 16, fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${copper}`, paddingBottom: 4 }}>
                  Entrar al demo →
                </a>
              </div>
            )}
            {activeTab === 2 && (
              // Tab 03 — positions the in-house R&D team as the bridge from catalog
              // products (Tacógrafo, SACEL) into bespoke software. Frames future
              // dashboard/analytics offerings as natural extensions of work already
              // happening, without inventing product names that don't exist yet.
              <div>
                <h3 style={{ margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: '-0.035em' }}>
                  Si tu problema no está en el catálogo,<br/><span style={{ color: copper }}>lo diseñamos.</span>
                </h3>
                <p style={{ marginTop: 24, fontSize: 19, lineHeight: 1.6, color: `${p.inkSub}` }}>
                  El mismo equipo que construyó SACEL y el Tacógrafo 4.0 toma tu operación como punto de partida. Extendemos SACEL con módulos propios, levantamos dashboards a medida o integramos con los sistemas que ya usas. Hardware, firmware y software bajo un mismo techo — sin APIs externas ni pagos a terceros.
                </p>
                <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                  {[
                    ['Dashboards a medida',  'KPIs y vistas específicas de tu operación'],
                    ['Extensiones SACEL',    'Módulos nuevos sobre la plataforma base'],
                    ['Integraciones',        'API con tu ERP, BI o datawarehouse'],
                    ['Prototipado rápido',   'De idea a piloto funcional en semanas'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ borderLeft: `2px solid ${copper}`, paddingLeft: 14 }}>
                      <div style={{ ...mono, fontSize: 14, color: ink, fontWeight: 600 }}>{k}</div>
                      <div style={{ fontSize: 13.5, color: `${p.inkDim}`, marginTop: 4 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <a href="./Investigacion-Desarrollo.html" style={{ marginTop: 36, display: 'inline-block', color: copper, fontSize: 16, fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${copper}`, paddingBottom: 4 }}>
                  Conversemos tu proyecto →
                </a>
              </div>
            )}

            {/* ── RESERVED tab content — not rendered until exposed in the nav above.
                  Replace this placeholder when the project info arrives.
              ----------------------------------------------------------------- */}
            {activeTab === 3 && (
              <div>
                <div style={{ ...mono, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: copper, marginBottom: 18, fontWeight: 600 }}>
                  — 04 · Próximamente
                </div>
                <h3 style={{ margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: '-0.035em' }}>
                  Proyecto en desarrollo.
                </h3>
                <p style={{ marginTop: 24, fontSize: 19, lineHeight: 1.6, color: `${p.inkSub}` }}>
                  Estamos trabajando en una nueva iniciativa. Pronto compartiremos detalles — reservamos este espacio para contar la historia cuando esté lista.
                </p>
                <div style={{ marginTop: 32, padding: 24, border: `1px dashed ${p.inkFaint}`, color: `${p.inkDim}` }}>
                  <div style={{ ...mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Slot reservado</div>
                  <div style={{ fontSize: 14 }}>Pendiente: brief de proyecto, especificaciones, gráficos y CTA.</div>
                </div>
              </div>
            )}
          </div>

          {/* right: visual — ALWAYS the vehicle→cluster→report flow */}
          <div>
            <div style={{
              opacity: 0.75,
              transform: 'scale(0.75)',
              transformOrigin: 'center right',
              willChange: 'transform, opacity',
            }}>
              <VehicleFlowViz theme={theme} hostRef={productsRef}/>
            </div>
          </div>
        </div>
        </div>{/* end sticky panel */}
      </section>

      {/* ─── SERVICES ─── */}
      <section data-services-section style={{ padding: `80px ${pad}px 100px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 48 }}>
          <div>
            <div style={{ ...mono, fontSize: 13, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', fontWeight: 500, marginBottom: 16 }}>— Capacidades</div>
            <h2 style={{ margin: 0, ...display, fontSize: 50, lineHeight: 1, letterSpacing: '-0.035em' }}>
              Más que productos:<br/>
              <span style={{ color: copper }}>ingeniería a pedido.</span>
            </h2>
          </div>
          <a style={{ color: p.inkSub, fontSize: 15, textDecoration: 'none', borderBottom: `1px solid ${p.inkDim}`, paddingBottom: 4 }}>Ver todos los servicios →</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: p.inkFaint, border: `1px solid ${p.inkFaint}` }}>
          {[
            { num: '01', t: 'Instalaciones SACEL', d: 'Puesta en marcha, capacitación y soporte técnico en todo Chile.' },
            { num: '02', t: 'Servicio Técnico', d: 'Mantención preventiva y correctiva para tacógrafos y periféricos.' },
            { num: '03', t: 'Diseño & Fabricación', d: 'PCBs, ensamble y certificación para unitarios o series industriales.' },
            { num: '04', t: 'Investigación & Desarrollo', d: 'Control automático, reingeniería y electrónica aplicada a medida.' },
          ].map((s, i) => (
            <div key={i} style={{ background: p.surface, padding: 32, minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'background .2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = palette === 'light' ? '#ede9df' : '#0a2a3c'}
              onMouseLeave={(e) => e.currentTarget.style.background = p.surface}>
              <div>
                <div style={{ ...mono, fontSize: 12, letterSpacing: '0.22em', color: copper, marginBottom: 28 }}>{s.num}</div>
                <h3 style={{ margin: 0, ...display, fontSize: 26, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{s.t}</h3>
                <p style={{ margin: '16px 0 0', fontSize: 15, color: `${p.inkSub}`, lineHeight: 1.55 }}>{s.d}</p>
              </div>
              <div style={{ ...mono, fontSize: 13, color: copper, letterSpacing: '0.16em', marginTop: 20 }}>VER SERVICIO →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTORS ─── */}
      <section style={{ padding: `0 ${pad}px 100px` }}>
        <div style={{ borderTop: `1px solid ${p.inkFaint}`, paddingTop: 48, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60, alignItems: 'start' }}>
          <div>
            <div style={{ ...mono, fontSize: 13, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 14 }}>— Industrias</div>
            <h2 style={{ margin: 0, ...display, fontSize: 48, lineHeight: 1.02, letterSpacing: '-0.03em' }}>Donde resolvemos.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {[
              ['Transporte', 'Flotas de bus, camión y taxi. Cumplimiento DT + telemetría.'],
              ['Minería', 'Control ambiental, instrumentación y sistemas de comunicación.'],
              ['Defensa', 'Electrónica especializada con protocolos y confidencialidad.'],
              ['Telecom', 'Centrales fija y móvil, implementación de wireless.'],
              ['Retail', 'Sistemas de control y automatización industrial.'],
              ['Universidades', 'Reingeniería e I+D para proyectos académicos.'],
            ].map(([t, d], i) => (
              <div key={i} style={{ padding: '22px 24px', borderLeft: i % 3 === 0 ? 'none' : `1px solid ${p.inkFaint}`, borderTop: i >= 3 ? `1px solid ${p.inkFaint}` : 'none' }}>
                <div style={{ ...display, fontSize: 24, letterSpacing: '-0.02em' }}>{t}</div>
                <div style={{ fontSize: 15, color: `${p.inkSub}`, marginTop: 8, lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP (shared component — Home + Empresa) ─── */}
      <StatsStrip theme={theme} pad={pad}/>

      {/* ─── TRUST STRIP (moved below stats) ─── */}
      <section style={{ padding: `24px ${pad}px`, background: palette === 'light' ? 'rgba(12,61,92,0.04)' : 'rgba(0,0,0,0.28)', borderTop: `1px solid ${p.inkFaint}`, borderBottom: `1px solid ${p.inkFaint}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ ...mono, fontSize: 12, letterSpacing: '0.22em', color: copper, textTransform: 'uppercase', fontWeight: 500, flexShrink: 0 }}>
            Operando con
          </div>
          <ClientLogos color={p.inkDim} surface={palette === 'light' ? 'light' : 'dark'}/>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section style={{ background: copper, color: '#0a1a26', padding: `80px ${pad}px`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -100, top: -100, width: 400, height: 400, border: '1px solid rgba(10,26,38,0.15)', borderRadius: '50%' }}/>
        <div style={{ position: 'absolute', right: 40, top: 40, width: 200, height: 200, border: '1px solid rgba(10,26,38,0.15)', borderRadius: '50%' }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
          <div>
            <div style={{ ...mono, fontSize: 13, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18, color: '#0a1a26' }}>— Hablemos</div>
            <h2 style={{ margin: 0, ...display, fontSize: 80, letterSpacing: '-0.045em', lineHeight: 0.98, maxWidth: 900 }}>
              ¿Tu flota está lista para<br/>la próxima normativa?
            </h2>
            <p style={{ margin: '24px 0 0', fontSize: 20, maxWidth: 580, color: 'rgba(10,26,38,0.78)', lineHeight: 1.55 }}>
              Visitamos tu operación, evaluamos los equipos instalados y te proponemos un plan de continuidad. Sin formularios — hablamos directo.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
            <a style={{ background: '#0a1a26', color: '#fff', padding: '20px 34px', fontWeight: 600, fontSize: 17, textDecoration: 'none', borderRadius: 2, textAlign: 'center' }}>contacto@andeselec.com</a>
            <a style={{ border: '1px solid #0a1a26', color: '#0a1a26', padding: '20px 34px', fontWeight: 600, fontSize: 17, textDecoration: 'none', borderRadius: 2, textAlign: 'center' }}>+56 2 2347 8700</a>
            <div style={{ ...mono, fontSize: 13, letterSpacing: '0.14em', color: 'rgba(10,26,38,0.68)', marginTop: 6, textAlign: 'center' }}>Carmen Covarrubias 398 · Ñuñoa</div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER (unused — SiteFooter below) ─── */}
      <footer style={{ display: 'none', background: p.deep, padding: `60px ${pad}px 32px`, color: p.inkSub }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, paddingBottom: 40, borderBottom: `1px solid ${p.inkFaint}` }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <AEMark size={28} surface={palette === 'light' ? 'light' : 'dark'}/>
              <div style={{ ...display, fontSize: 16, color: ink }}>Andes Electrónica</div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, maxWidth: 320 }}>
              Desde 1991 desarrollando productos y servicios electrónicos de alta calidad para transporte, minería, defensa y telecomunicaciones.
            </p>
            <div style={{ marginTop: 20, ...mono, fontSize: 10.5, letterSpacing: '0.12em', color: `${p.inkDim}` }}>
              ISO 9001 · Cert. DT N°139/2009
            </div>
          </div>
          {[
            ['Productos', ['Sistema SACEL', 'Tacógrafo 4.0', 'Visor VI7GPS']],
            ['Servicios', ['Instalaciones', 'Servicio técnico', 'Diseño & fabricación', 'I+D']],
            ['Empresa', ['Quiénes somos', 'ISO 9001', 'Contacto', 'Privacidad']],
          ].map(([h, items]) => (
            <div key={h}>
              <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.18em', color: copper, textTransform: 'uppercase', marginBottom: 16 }}>{h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                {items.map(i => <span key={i} style={{ color: `${p.inkSub}` }}>{i}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, ...mono, fontSize: 11, letterSpacing: '0.1em', color: `${p.inkDim}` }}>
          <span>© 2026 Andes Electrónica S.A. · Santiago, Chile</span>
          <span>contacto@andeselec.com · +56 2 2347 8700</span>
        </div>
      </footer>

      <SiteFooter theme={theme} pad={pad}/>

      {/* Page-scoped animations now live in shared.jsx (injected once via the
          __andes_global_anims style tag). Keeping this comment as a breadcrumb
          for anyone tracing where pulse/tabFadeIn/logoGlitch/ringPulse come from. */}
    </div>
  );
}

// ─── Stats strip + count-up: moved to shared.jsx — see <StatsStrip theme=.../>

// ─── SACEL mini dashboard mock
function SacelDashMock({ accent = '#c07d2e', ink = '#e8e4dc', inkDim = 'rgba(232,228,220,0.5)', inkFaint = 'rgba(232,228,220,0.08)', inkSub = 'rgba(232,228,220,0.72)' }) {
  const mono = { fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace' };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, ...mono, fontSize: 10, letterSpacing: '0.14em' }}>
        <span style={{ color: inkDim }}>SACEL · DASHBOARD</span>
        <span style={{ color: accent }}>● LIVE</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[['Conductores activos', '847'], ['Infracciones hoy', '3']].map(([k, v], i) => (
          <div key={i} style={{ padding: 14, background: 'rgba(192,125,46,0.06)', border: `1px solid ${accent}`, borderLeftWidth: 3 }}>
            <div style={{ ...mono, fontSize: 9, color: inkDim, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{k}</div>
            <div style={{ ...mono, fontSize: 26, color: ink, fontWeight: 600, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(232,228,220,0.08)' }}>
        <div style={{ ...mono, fontSize: 9, color: inkDim, letterSpacing: '0.14em', marginBottom: 8 }}>TELEMETRÍA · ÚLTIMAS 6H</div>
        <svg width="100%" height="70" viewBox="0 0 300 70">
          <path d="M 0 50 Q 20 30, 40 40 T 80 35 T 120 45 T 160 25 T 200 30 T 240 20 T 300 30" stroke={accent} strokeWidth="1.5" fill="none"/>
          <path d="M 0 50 Q 20 30, 40 40 T 80 35 T 120 45 T 160 25 T 200 30 T 240 20 T 300 30 L 300 70 L 0 70 Z" fill={accent} fillOpacity="0.15"/>
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="70" stroke="rgba(232,228,220,0.06)" strokeWidth="0.5"/>
          ))}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {['Turbus · 42', 'Cruz del Sur · 28', 'EFE · 18', 'ETM · 12'].map(t => (
          <span key={t} style={{ ...mono, fontSize: 9, padding: '4px 8px', background: inkFaint, color: inkSub, letterSpacing: '0.08em' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── FloatingLogo: fixed-position parallax logo, fades when services section enters viewport
function FloatingLogo({ theme, palette, pad }) {
  const { p, copper } = theme;
  const ref = React.useRef(null);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const products = document.querySelector('[data-products-section]');
    if (!products) return;
    const io = new IntersectionObserver(([entry]) => {
      // Fade out once products is well into viewport (crosses into top half)
      setHidden(entry.isIntersecting);
    }, { threshold: 0, rootMargin: '0px 0px -55% 0px' });
    io.observe(products);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (ref.current) {
          // Faster parallax: drifts up at 40% of scroll rate
          const offset = window.scrollY * 0.4;
          ref.current.style.transform = `translateY(-${offset}px)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        right: 'max(48px, calc((100vw - 1280px) / 2 + 48px))',
        top: 140,
        width: 'min(420px, 32vw)',
        aspectRatio: '1 / 1',
        pointerEvents: 'none',
        zIndex: 5,
        opacity: hidden ? 0 : 1,
        transition: `opacity ${theme.durSlow || '260ms'} ${theme.ease || 'ease'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        willChange: 'transform, opacity',
      }}>
      {/* concentric rings */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${p.inkFaint}` }}/>
      <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', border: `1px solid ${p.inkFaint}` }}/>
      <div style={{ position: 'absolute', inset: '22%', borderRadius: '50%', border: `1px dashed ${p.inkFaint}` }}/>
      <img src={(window.__resources && window.__resources.aeLogoColour) || 'assets/logos/AE-logo-colour.svg'} alt=""
        style={{ width: '62%', height: '62%', objectFit: 'contain', display: 'block', position: 'relative', zIndex: 1,
          filter: palette === 'light' ? 'none' : 'brightness(0) invert(1)' }}/>
      {/* corner ticks */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i)=>(
        <div key={i} style={{ position:'absolute', [v]:0, [h]:0, width:18, height:18,
          borderTop: v==='top'?`1px solid ${copper}`:'none',
          borderBottom: v==='bottom'?`1px solid ${copper}`:'none',
          borderLeft: h==='left'?`1px solid ${copper}`:'none',
          borderRight: h==='right'?`1px solid ${copper}`:'none' }}/>
      ))}
    </div>
  );
}

window.V2DeepTeal = V2DeepTeal;

// ─── SignalFlow ────────────────────────────────────────────────────────────────
// Abstract horizontal "signal pathway" schematic. Pure visual rhythm: three
// horizontal lanes, junction connectors, static nodes and travelling pulses.
// No labels, no copy — meant to evoke what Andes does (electronics, telemetry,
// signal flow) without adding information to the page. Speaks the same language
// as the hero floating logo (concentric rings + corner ticks).
// ────────────────────────────────────────────────────────────────────────────────
function SignalFlow({ theme, palette }) {
  const { p, copper, mono } = theme;
  const isLight = palette === 'light';

  // Three horizontal lanes (y positions inside the 1200×200 viewBox)
  const lanes = [44, 100, 156];

  // Paths the travelling pulses follow. Each path id is referenced by its pulse.
  // Designed so pulses sometimes hop between lanes via short vertical jogs.
  const flowPaths = [
    { id: 'sf-a', d: `M -10 ${lanes[0]} L 280 ${lanes[0]} L 320 ${lanes[1]} L 720 ${lanes[1]} L 760 ${lanes[0]} L 1210 ${lanes[0]}`, dur: 8.4 },
    { id: 'sf-b', d: `M -10 ${lanes[1]} L 460 ${lanes[1]} L 500 ${lanes[2]} L 880 ${lanes[2]} L 920 ${lanes[1]} L 1210 ${lanes[1]}`, dur: 11.2 },
    { id: 'sf-c', d: `M -10 ${lanes[2]} L 180 ${lanes[2]} L 220 ${lanes[1]} L 600 ${lanes[1]} L 640 ${lanes[2]} L 1210 ${lanes[2]}`, dur: 9.7 },
  ];

  // Static structural lines under everything — drawn as full-lane rules so the
  // pulse paths above visually "ride" on real infrastructure.
  const rules = lanes.map((y, i) => ({ y, dash: i === 1 ? '0' : '4 6' }));

  // Node positions — circles distributed across the diagram, some hollow, some
  // filled, three of them with pulsing concentric rings.
  const nodes = [
    { x: 80,   y: lanes[0], r: 4, kind: 'filled' },
    { x: 280,  y: lanes[0], r: 5, kind: 'pulse'  },
    { x: 480,  y: lanes[0], r: 3, kind: 'hollow' },
    { x: 760,  y: lanes[0], r: 5, kind: 'hollow' },
    { x: 1020, y: lanes[0], r: 4, kind: 'filled' },

    { x: 160,  y: lanes[1], r: 3, kind: 'hollow' },
    { x: 320,  y: lanes[1], r: 5, kind: 'hollow' },
    { x: 600,  y: lanes[1], r: 6, kind: 'pulse'  },
    { x: 880,  y: lanes[1], r: 4, kind: 'filled' },
    { x: 1140, y: lanes[1], r: 4, kind: 'hollow' },

    { x: 220,  y: lanes[2], r: 4, kind: 'filled' },
    { x: 500,  y: lanes[2], r: 3, kind: 'hollow' },
    { x: 780,  y: lanes[2], r: 5, kind: 'pulse'  },
    { x: 1040, y: lanes[2], r: 3, kind: 'hollow' },
  ];

  // Token resolution: keep palette discipline — copper for accents, ink-faint
  // for background structure, inkSub for the secondary nodes.
  const lineCol      = isLight ? 'rgba(12,61,92,0.18)' : 'rgba(232,228,220,0.22)';
  const lineColFaint = isLight ? 'rgba(12,61,92,0.10)' : 'rgba(232,228,220,0.12)';
  const surfaceFill  = isLight ? '#f5f2ed' : '#05131f';
  const labelCol     = isLight ? 'rgba(12,61,92,0.42)' : 'rgba(232,228,220,0.40)';

  return (
    <div style={{
      marginTop: 8,
      position: 'relative',
      width: '100%',
      maxWidth: 1240,
      marginLeft: 'auto', marginRight: 'auto',
    }}>
      {/* corner ticks (echo the floating-logo language) */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v, h], i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', [v]: 16, [h]: 0, width: 14, height: 14,
          borderTop: v === 'top' ? `1px solid ${copper}` : 'none',
          borderBottom: v === 'bottom' ? `1px solid ${copper}` : 'none',
          borderLeft: h === 'left' ? `1px solid ${copper}` : 'none',
          borderRight: h === 'right' ? `1px solid ${copper}` : 'none',
          zIndex: 2,
        }}/>
      ))}

      <svg viewBox="0 0 1200 200" preserveAspectRatio="none"
        width="100%" height="220" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          {/* Soft glow around copper pulses */}
          <filter id="sf-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Each travel path is defined here so circles can reference it via mpath */}
          {flowPaths.map(fp => (
            <path key={fp.id} id={fp.id} d={fp.d} fill="none"/>
          ))}
        </defs>

        {/* ── Background lane rules ────────────────────────────────────── */}
        {rules.map((r, i) => (
          <line key={i} x1="0" y1={r.y} x2="1200" y2={r.y}
            stroke={i === 1 ? lineCol : lineColFaint} strokeWidth="1"
            strokeDasharray={r.dash}/>
        ))}

        {/* ── Visible "flow paths" — drawn at low alpha so the user can see the
              routes the pulses will take. Subtle, like wire traces on a PCB. ── */}
        {flowPaths.map(fp => (
          <path key={`route-${fp.id}`} d={fp.d} fill="none"
            stroke={lineColFaint} strokeWidth="1.2"/>
        ))}

        {/* ── Tick marks along the middle lane — schematic embellishment ── */}
        {Array.from({ length: 25 }).map((_, i) => {
          const x = 24 + i * 48;
          return (
            <line key={`tick-${i}`} x1={x} y1={lanes[1] - 4} x2={x} y2={lanes[1] + 4}
              stroke={lineColFaint} strokeWidth="1"/>
          );
        })}

        {/* ── Static nodes ─────────────────────────────────────────────── */}
        {nodes.map((n, i) => {
          if (n.kind === 'filled') {
            return (
              <circle key={i} cx={n.x} cy={n.y} r={n.r}
                fill={copper} stroke="none"/>
            );
          }
          if (n.kind === 'hollow') {
            return (
              <circle key={i} cx={n.x} cy={n.y} r={n.r}
                fill={surfaceFill} stroke={lineCol} strokeWidth="1.2"/>
            );
          }
          // 'pulse' — a filled core with two expanding concentric rings
          return (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r + 14} fill="none"
                stroke={copper} strokeWidth="1" opacity="0">
                <animate attributeName="r" values={`${n.r};${n.r + 22}`} dur="2.6s"
                  begin={`${i * 0.4}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;0" dur="2.6s"
                  begin={`${i * 0.4}s`} repeatCount="indefinite"/>
              </circle>
              <circle cx={n.x} cy={n.y} r={n.r + 14} fill="none"
                stroke={copper} strokeWidth="1" opacity="0">
                <animate attributeName="r" values={`${n.r};${n.r + 22}`} dur="2.6s"
                  begin={`${i * 0.4 + 1.3}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;0" dur="2.6s"
                  begin={`${i * 0.4 + 1.3}s`} repeatCount="indefinite"/>
              </circle>
              <circle cx={n.x} cy={n.y} r={n.r} fill={copper}/>
            </g>
          );
        })}

        {/* ── Travelling pulses along the flow paths ──────────────────── */}
        {flowPaths.map((fp, i) => (
          <g key={`pulse-${fp.id}`} filter="url(#sf-glow)">
            {/* Bright head */}
            <circle r="3.4" fill={copper}>
              <animateMotion dur={`${fp.dur}s`} repeatCount="indefinite" begin={`${i * 0.9}s`}>
                <mpath href={`#${fp.id}`}/>
              </animateMotion>
            </circle>
            {/* Trailing dimmer pulse, offset slightly */}
            <circle r="2.2" fill={copper} opacity="0.5">
              <animateMotion dur={`${fp.dur}s`} repeatCount="indefinite" begin={`${i * 0.9 + 0.35}s`}>
                <mpath href={`#${fp.id}`}/>
              </animateMotion>
            </circle>
            <circle r="1.6" fill={copper} opacity="0.25">
              <animateMotion dur={`${fp.dur}s`} repeatCount="indefinite" begin={`${i * 0.9 + 0.7}s`}>
                <mpath href={`#${fp.id}`}/>
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* ── Edge markers — small vertical brackets at left/right gutter ── */}
        {[0, 200].includes && [
          ['M 0 30 L 0 50 L 8 50',     '0 30 0 50 8 50'],
          ['M 0 150 L 0 170 L 8 170',  '0 150 0 170 8 170'],
          ['M 1200 30 L 1200 50 L 1192 50',    null],
          ['M 1200 150 L 1200 170 L 1192 170', null],
        ].map((_, i) => null)}

        {/* Left/right end-caps */}
        {lanes.map((y, i) => (
          <g key={`cap-${i}`}>
            <line x1="0" y1={y - 6} x2="0" y2={y + 6} stroke={lineCol} strokeWidth="1.2"/>
            <line x1="1200" y1={y - 6} x2="1200" y2={y + 6} stroke={lineCol} strokeWidth="1.2"/>
          </g>
        ))}
      </svg>
    </div>
  );
}
window.SignalFlow = SignalFlow;

// ─── Hero background for LIGHT palette
// Uses a bespoke light-surface render (assets/hero/andes-sphere-bg-light.png) —
// the AE-marked sphere over a warm cream surface with copper circuit traces and
// perspective grid. No filter treatment: the image is already tonally matched to
// the cream palette and should read as-is.
//
// Positioning mirrors the dark variant so the sphere lands in the same empty-left
// column regardless of palette.
function HeroBgLight({ floatRef, pad, copper }) {
  return (
    <div ref={floatRef}
      aria-hidden="true"
      className="hero-bg-image"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: "url('assets/hero/andes-sphere-bg-light.png')",
        // Identical positioning math as the dark variant — the source image is
        // composed with the sphere at ~22% from left, same as the dark photo.
        backgroundSize: '100vw auto',
        backgroundPosition: `calc(28vw - ${(820 + pad) / 2}px) 50%`,
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.92,
        willChange: 'opacity, transform',
        // Mask: fade only the right edge into the page bg (so circuit traces
        // dissolve before they reach the headline column) and the bottom into
        // the surface below. Left edge stays full so the perspective grid lines
        // reach the viewport edge — that anchors the composition visually.
        WebkitMaskImage:
          'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.55) 76%, transparent 96%),' +
          'linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.45) 85%, transparent 100%)',
        WebkitMaskComposite: 'source-in',
        maskImage:
          'linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.55) 76%, transparent 96%),' +
          'linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.45) 85%, transparent 100%)',
        maskComposite: 'intersect',
      }}/>
  );
}
window.HeroBgLight = HeroBgLight;
