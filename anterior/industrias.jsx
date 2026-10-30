// Industrias — Map + 6 industry cards with animated SVG patterns
function Industrias({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, displayEditorial, mono, body } = theme;
  const pad = 72;

  const industries = [
    {
      num: '01',
      key: 'transporte',
      title: 'Transporte',
      Pattern: PatternTransporte,
      tagline: 'La flota que mueve al país.',
      body: 'Operadores interurbanos y urbanos, transporte de carga y pasajeros. Tacógrafos certificados, plataforma SACEL y telemetría en tiempo real.',
      stats: [['[Equipos]', 'Tacógrafos en operación'], ['[Flotas]', 'Operadores activos'], ['[Año]', 'Desde']],
    },
    {
      num: '02',
      key: 'mineria',
      title: 'Minería',
      Pattern: PatternMineria,
      tagline: 'Electrónica para condiciones extremas.',
      body: 'Equipos especializados para ambientes abrasivos. Certificaciones de seguridad, tolerancia térmica extendida y desarrollos a medida bajo NDA.',
      stats: [['[IP]', 'Grado de protección'], ['[Rango]', 'Temperatura operativa'], ['[Años]', 'Experiencia sectorial']],
    },
    {
      num: '03',
      key: 'defensa',
      title: 'Defensa',
      Pattern: PatternDefensa,
      tagline: 'Ingeniería para aplicaciones críticas.',
      body: 'Hardware dedicado, reingeniería de sistemas legacy y mantención de electrónica especializada. Diseño y fabricación en Chile, cadena de custodia controlada.',
      stats: [['[Años]', 'En el sector'], ['ISO 9001', 'Calidad certificada'], ['CL', 'Diseño y fabricación nacional']],
    },
    {
      num: '04',
      key: 'telco',
      title: 'Telecomunicaciones',
      Pattern: PatternTelco,
      tagline: 'Conectividad donde la red no llega.',
      body: 'Módulos de comunicación industrial, gateways y soluciones de monitoreo remoto. Integración con redes celulares, satelitales y RF privadas.',
      stats: [['[Equipos]', 'Gateways instalados'], ['4G/Sat', 'Conectividad'], ['MQTT', 'Protocolo abierto']],
    },
  ];

  return (
    <PageShell theme={theme} current="industrias">
      <Breadcrumb theme={theme} items={[{ label: 'Home', href: './index.html' }, { label: 'Industrias' }]}/>
      <PageHero
        theme={theme}
        eyebrow="Industrias"
        title="Ingeniería electrónica para operaciones donde la continuidad no es negociable."
        accentWord="no es negociable"
        credentials="Transporte · Minería · Defensa · Telecomunicaciones"
        subtitle="Cuatro verticales en los que hemos construido expertise por más de tres décadas. Cada industria con su lenguaje técnico, cadencia operacional y requisitos normativos — los aprendemos de adentro."
      />

      {/* ─── MAPA OPERACIONAL ─── */}
      <section style={{ padding: `40px ${pad}px 80px`, borderTop: `1px solid ${p.inkFaint}`, position: 'relative' }}>
        <ChileMap
          accent={copper}
          ink={p.ink}
          inkSub={p.inkSub}
          inkDim={p.inkDim}
          inkFaint={p.inkFaint}
          surface={p.surface}
        />
      </section>

      {/* ─── SECTION HEAD ─── */}
      <section style={{ padding: `48px ${pad}px 24px`, borderTop: `1px solid ${p.inkFaint}` }}>
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: p.inkDim, textTransform: 'uppercase', fontWeight: 500, marginBottom: 20 }}>
          — Verticales atendidos
        </div>
        <h2 style={{ margin: 0, ...(displayEditorial || display), fontSize: 42, lineHeight: 1.1, letterSpacing: '-0.025em', maxWidth: 760, fontWeight: 600 }}>
          Cuatro industrias, un mismo estándar de ingeniería.
        </h2>
        <div style={{ marginTop: 24, height: 1, width: 80, background: copper }}/>
      </section>

      {/* ─── 4 INDUSTRIAS GRID ─── */}
      <section style={{ padding: `40px ${pad}px 100px`, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: p.inkFaint }}>
        {industries.map(ind => (
          <IndustryCard key={ind.key} theme={theme} {...ind}/>
        ))}
      </section>

      <CTABand theme={theme}
        title="¿Tu industria requiere otra cosa?"
        accentWord="otra cosa"
        primary={{ label: 'Hablemos', href: './Contacto.html' }}
        secondary={{ label: 'Ver I+D', href: './Investigacion-Desarrollo.html' }}
      />
    </PageShell>
  );
}

function IndustryCard({ theme, num, title, Pattern, tagline, body, stats, onClick }) {
  const { p, copper, display, displayEditorial, mono, ease, durBase } = theme;
  const [hover, setHover] = React.useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: p.bg,
        padding: 0,
        position: 'relative',
        cursor: 'default',
        transition: `background ${durBase} ${ease}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480,
      }}
    >
      {/* Pattern visual */}
      <div style={{
        height: 240,
        borderBottom: `1px solid ${p.inkFaint}`,
        background: hover ? 'rgba(192,125,46,0.04)' : 'transparent',
        transition: `background ${durBase} ${ease}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Pattern accent={copper} ink={p.ink} active={hover}/>
        {/* Numeral overlay */}
        <div style={{
          position: 'absolute', top: 16, left: 20,
          ...mono, fontSize: 10.5, letterSpacing: '0.22em', color: copper, fontWeight: 500,
        }}>
          {num}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 32px 32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ margin: 0, ...(displayEditorial || display), fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.025em', color: p.ink, fontWeight: 600 }}>
          {title}
        </h3>
        <div style={{ marginTop: 12, fontSize: 15, color: p.inkSub, fontStyle: 'italic', lineHeight: 1.4 }}>
          {tagline}
        </div>
        <p style={{ margin: '20px 0 0', fontSize: 14.5, lineHeight: 1.6, color: p.inkSub, maxWidth: 520 }}>
          {body}
        </p>

        {/* Stats — 3 column compact */}
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${p.inkFaint}`, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {stats.map(([v, k], i) => (
            <div key={i}>
              <div style={{ ...(displayEditorial || display), fontSize: 20, lineHeight: 1, color: p.ink, letterSpacing: '-0.015em', fontWeight: 600 }}>
                {v}
              </div>
              <div style={{ ...mono, fontSize: 9.5, letterSpacing: '0.16em', color: p.inkDim, marginTop: 8, fontWeight: 500, textTransform: 'uppercase', lineHeight: 1.3 }}>
                {k}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copper edge on hover */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: hover ? 3 : 0,
        background: copper,
        transition: `width ${durBase} ${ease}`,
      }}/>
    </article>
  );
}

window.Industrias = Industrias;
