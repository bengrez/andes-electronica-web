// Visor VI7GPS — product one-pager
function VisorVI7GPS({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono } = theme;
  const pad = 72;

  return (
    <PageShell theme={theme} current="productos">
      <Breadcrumb theme={theme} items={[
        { label: 'Home', href: './index.html' },
        { label: 'Productos', href: './Productos.html' },
        { label: 'Visor VI7GPS' }
      ]}/>

      <section style={{ padding: `48px ${pad}px 56px`, display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 28, fontWeight: 500 }}>
            — Periférico · Visor VI7GPS
          </div>
          <h1 style={{ margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.025em', maxWidth: 760, fontWeight: 600 }}>
            Visor <span style={{ color: copper }}>VI7GPS</span> — display dual de velocidad para cabina y pasajeros con integración CAN al tacógrafo.
          </h1>
          <div style={{ marginTop: 32, height: 1, width: 96, background: copper }}/>
          <p style={{ marginTop: 28, fontSize: 17, lineHeight: 1.6, color: p.inkSub, maxWidth: 560 }}>
            Carcasa IP54, alertas visuales configurables de exceso de velocidad, integración directa con el tacógrafo vía CAN y montaje universal DIN 24V.
          </p>
          <div style={{ marginTop: 28, ...mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.inkDim, fontWeight: 500 }}>
            IP54 &nbsp;·&nbsp; 24 VDC &nbsp;·&nbsp; CAN bus &nbsp;·&nbsp; Visibilidad diurna
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 28, alignItems: 'center', fontSize: 14, fontWeight: 500 }}>
            <a href="./Contacto.html?topic=Visor%20VI7GPS" style={{ color: p.ink, textDecoration: 'none', borderBottom: `1px solid ${copper}`, paddingBottom: 4 }}>Cotizar →</a>
            <a href="#specs" style={{ color: p.inkSub, textDecoration: 'none', borderBottom: `1px solid ${p.inkFaint}`, paddingBottom: 4 }}>Ver hoja técnica</a>
          </div>
        </div>
        <div style={{ background: '#000', border: `1px solid ${p.inkFaint}`, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div style={{ ...mono, fontSize: 180, fontWeight: 700, color: copper, letterSpacing: '-0.04em', lineHeight: 1 }}>078</div>
          <div style={{ ...mono, fontSize: 16, color: 'rgba(232,228,220,0.6)', letterSpacing: '0.24em', marginTop: 8 }}>KM/H</div>
          <div style={{ marginTop: 28, display: 'flex', gap: 14, ...mono, fontSize: 10, color: 'rgba(232,228,220,0.42)', letterSpacing: '0.16em' }}>
            <span>GNSS</span><span>·</span><span>CAN</span><span>·</span><span>OK</span>
          </div>
        </div>
      </section>

      <SectionHead theme={theme} num="02" eyebrow="Features" title="Pensado para cabina y pasajero" border/>
      <div style={{ padding: `20px ${pad}px 60px`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          ['Display dual', 'Cara frontal para conductor + cara posterior visible para pasajeros.'],
          ['Alertas configurables', 'Parpadeo a umbrales definidos por flota. 3 zonas (caution / warn / crit).'],
          ['Integración CAN', 'Conecta al Tacógrafo 4.0 o a la ECU del vehículo directamente.'],
          ['Visibilidad diurna', 'LED de alta luminancia, contraste pleno bajo luz solar directa.'],
          ['Montaje universal', 'Fijación DIN 24V, montaje en tablero o viga transversal.'],
          ['Sin mantención', 'Sólido, sin partes móviles. Vida útil estimada 50 000 h.'],
        ].map(([t, d], i) => (
          <div key={i} style={{ padding: 24, background: p.surface, borderLeft: `2px solid ${copper}` }}>
            <h3 style={{ margin: 0, ...display, fontSize: 20, letterSpacing: '-0.015em' }}>{t}</h3>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: p.inkSub, lineHeight: 1.55 }}>{d}</p>
          </div>
        ))}
      </div>

      <SectionHead theme={theme} num="03" eyebrow="Specs" title="Hoja técnica" border/>
      <div id="specs" style={{ padding: `20px ${pad}px 100px` }}>
        <SpecTable theme={theme} rows={[
          ['Alimentación', '9–32 VDC · protección polaridad inversa'],
          ['Consumo', '< 2W operación típica'],
          ['Display', 'LED 7-segmentos · dual frontal/posterior · 45mm'],
          ['Luminancia', '3 500 cd/m² · autodimming crepuscular'],
          ['Protección', 'IP54 · operación -30°C a +70°C'],
          ['Interfaz', 'CAN 2.0B · entrada pulsos (opcional)'],
          ['Vida útil', '50 000 h (LEDs)'],
          ['Dimensiones', '160 × 70 × 40 mm'],
          ['Montaje', 'DIN 24V · 4 puntos de fijación'],
          ['Certificación', 'Homologación transporte público'],
        ]}/>
      </div>

      <CTABand theme={theme}
        title="¿Lo instalamos en tu flota?"
        accentWord="tu flota"
        primary={{ label: 'Cotizar VI7GPS', href: './Contacto.html?topic=Visor%20VI7GPS' }}
        secondary={{ label: 'Ver Tacógrafo 4.0', href: './Tacografo-4.0.html' }}
      />
    </PageShell>
  );
}
window.VisorVI7GPS = VisorVI7GPS;
