// Productos — index page
function Productos({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;

  const products = [
    {
      label: '01 — PLATAFORMA',
      title: 'Sistema SACEL',
      description: 'Control de asistencia, horas de conducción y monitoreo de flota en tiempo real. Reportes DT-24 y detección de infracciones art. 25.',
      meta: '5 000+ tacógrafos · 1 000+ buses',
      href: './Sistema-SACEL.html',
      featured: true,
    },
    {
      label: '02 — HARDWARE',
      title: 'Tacógrafo 4.0',
      description: 'Registro certificado de conducción con GNSS, SmartCard, CAN bus y transmisión cifrada. Caja negra integrada.',
      meta: 'IP54 · CAN 2.0B · 4G · GNSS',
      href: './Tacografo-4.0.html',
    },
    {
      label: '03 — PERIFÉRICO',
      title: 'Visor VI7GPS',
      description: 'Display dual de velocidad para cabina y pasajeros. Alertas visuales de excesos.',
      meta: 'IP54 · 24VDC · CAN',
      href: './Visor-VI7GPS.html',
    },
  ];

  return (
    <PageShell theme={theme} current="productos">
      <Breadcrumb theme={theme} items={[{ label: 'Home', href: './index.html' }, { label: 'Productos' }]}/>
      <PageHero
        theme={theme}
        eyebrow="Catálogo de productos"
        title="Hardware y plataforma de gestión de flota desarrollados íntegramente en Chile."
        accentWord="íntegramente"
        credentials="ISO 9001:2015 · Res. DT N°139/2009 · Res. Exenta N°1081 — DT"
        subtitle="Tacógrafos certificados, plataforma de gestión de flota y periféricos integrados — un stack completo operando sobre más de 1 000 buses en el país."
      />

      <CardGrid theme={theme} columns={3} paddingBottom={60}>
        {products.map((pd, i) => <Card key={i} theme={theme} {...pd}/>)}
      </CardGrid>

      {/* Comparativa / por qué nosotros */}
      <SectionHead theme={theme} num="02" eyebrow="Ventaja operacional" title="Por qué integramos todo el stack" accentWord="todo" border/>
      <div style={{ padding: '20px 72px 100px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
        {[
          ['Hardware propio', 'Diseñamos el circuito, elegimos los componentes. No dependemos de SKUs descontinuados ni de proveedores offshore.'],
          ['Firmware propio', 'Actualizaciones OTA, parches de seguridad, nuevos reportes — sin esperar una release externa.'],
          ['Soporte local', 'Taller, técnicos e ingeniería en Santiago. Reemplazos y visitas a terreno con SLA acotado.'],
        ].map(([t, d], i) => (
          <div key={i} style={{ background: p.surface, padding: 28, borderTop: `2px solid ${copper}` }}>
            <div style={{ ...mono, fontSize: 11, color: copper, letterSpacing: '0.18em', marginBottom: 14 }}>0{i+1}</div>
            <h3 style={{ margin: 0, ...display, fontSize: 24, letterSpacing: '-0.02em' }}>{t}</h3>
            <p style={{ margin: '12px 0 0', fontSize: 14, color: p.inkSub, lineHeight: 1.55 }}>{d}</p>
          </div>
        ))}
      </div>

      <CTABand theme={theme}
        title="¿Listo para evaluar tu flota?"
        accentWord="tu flota"
        primary={{ label: 'Agendar demo', href: './Contacto.html' }}
        secondary={{ label: 'Ver capacidades', href: './Empresa.html' }}
      />
    </PageShell>
  );
}
window.Productos = Productos;
