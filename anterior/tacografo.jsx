// Tacógrafo 4.0 — product one-pager
function Tacografo40({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono } = theme;
  const pad = 72;

  return (
    <PageShell theme={theme} current="productos">
      <Breadcrumb theme={theme} items={[
        { label: 'Home', href: './index.html' },
        { label: 'Productos', href: './Productos.html' },
        { label: 'Tacógrafo 4.0' }
      ]}/>

      <TacografoScroll theme={theme}/>

      <section style={{ padding: `48px ${pad}px 56px`, display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 28, fontWeight: 500 }}>
            — Hardware · Tacógrafo 4.0
          </div>
          <h1 style={{ margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.025em', maxWidth: 760, fontWeight: 600 }}>
            Tacógrafo <span style={{ color: copper }}>4.0</span> — registro certificado de conducción para flota de transporte público y carga.
          </h1>
          <div style={{ marginTop: 32, height: 1, width: 96, background: copper }}/>
          <p style={{ marginTop: 28, fontSize: 17, lineHeight: 1.6, color: p.inkSub, maxWidth: 560 }}>
            GNSS multiconstelación, SmartCard de conductor, CAN bus y transmisión cifrada 4G. Caja negra integrada con capacidad para 365 días de operación continua.
          </p>
          <div style={{ marginTop: 28, ...mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.inkDim, fontWeight: 500 }}>
            IP54 &nbsp;·&nbsp; CAN 2.0B &nbsp;·&nbsp; 4G/GNSS &nbsp;·&nbsp; Res. DT N°139/2009
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 28, alignItems: 'center', fontSize: 14, fontWeight: 500 }}>
            <a href="./Contacto.html?topic=Tac%C3%B3grafo%204.0" style={{ color: p.ink, textDecoration: 'none', borderBottom: `1px solid ${copper}`, paddingBottom: 4 }}>Cotizar →</a>
            <a href="#specs" style={{ color: p.inkSub, textDecoration: 'none', borderBottom: `1px solid ${p.inkFaint}`, paddingBottom: 4 }}>Ver hoja técnica</a>
          </div>
        </div>
        <div style={{ background: p.surface, border: `1px solid ${p.inkFaint}`, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TacoDevice w={360} accent={copper}/>
        </div>
      </section>

      <SectionHead theme={theme} num="02" eyebrow="Features" title="Qué lo hace distinto" accentWord="distinto" border/>
      <div style={{ padding: `20px ${pad}px 60px`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          ['Caja negra 365 días', 'Memoria flash con registro continuo. Extracción forense ante incidente.'],
          ['GNSS multiconstelación', 'GPS + GLONASS + Galileo. HDOP < 1.5 en operación típica.'],
          ['SmartCard de conductor', 'Identificación criptográfica. Turno, licencia, horas acumuladas.'],
          ['CAN bus nativo', 'Lectura de ECU — consumo, RPM, temperatura, fallas.'],
          ['4G + backup GSM', 'Transmisión cada 10s. Modo store-and-forward en sombra.'],
          ['OTA firmware', 'Actualizaciones firmadas desde plataforma SACEL.'],
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
          ['Consumo', '< 3W operación · < 0.5W reposo'],
          ['Protección', 'IP54 · operación -20°C a +70°C'],
          ['GNSS', 'Multiconstelación · TTFF < 30s frío'],
          ['Comunicación', 'LTE Cat-M1 · GSM fallback · CAN 2.0B'],
          ['SmartCard', 'ISO 7816 · criptografía asimétrica'],
          ['Memoria', '8 GB flash · ~365 días rolling'],
          ['Certificación', 'DT N°139/2009 · homologación vigente'],
          ['Dimensiones', '178 × 50 × 120 mm · DIN 24V'],
          ['Interfaz', 'Display OLED · 4 botones · zócalo SmartCard'],
        ]}/>
      </div>

      <CTABand theme={theme}
        title="¿Lo evaluamos en tu flota?"
        accentWord="tu flota"
        primary={{ label: 'Cotizar Tacógrafo 4.0', href: './Contacto.html?topic=Tac%C3%B3grafo%204.0' }}
        secondary={{ label: 'Ver Sistema SACEL', href: './Sistema-SACEL.html' }}
      />
    </PageShell>
  );
}
window.Tacografo40 = Tacografo40;
