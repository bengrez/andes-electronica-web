// Sistema SACEL — product one-pager
function SistemaSACEL({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono } = theme;
  const pad = 72;

  return (
    <PageShell theme={theme} current="productos">
      <Breadcrumb theme={theme} items={[
        { label: 'Home', href: './index.html' },
        { label: 'Productos', href: './Productos.html' },
        { label: 'Sistema SACEL' }
      ]}/>

      <section style={{ padding: `48px ${pad}px 56px`, display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 28, fontWeight: 500 }}>
            — Plataforma · Sistema SACEL
          </div>
          <h1 style={{ margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.025em', maxWidth: 760, fontWeight: 600 }}>
            Sistema <span style={{ color: copper }}>SACEL</span> — gestión de flota, control de jornada y reportería ante la Dirección del Trabajo.
          </h1>
          <div style={{ marginTop: 32, height: 1, width: 96, background: copper }}/>
          <p style={{ marginTop: 28, fontSize: 17, lineHeight: 1.6, color: p.inkSub, maxWidth: 560 }}>
            Plataforma web con reportes DT-24, alertas en tiempo real y trazabilidad completa del conductor. Detección automática de infracciones art. 25.
          </p>
          <div style={{ marginTop: 28, ...mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.inkDim, fontWeight: 500 }}>
            Res. DT N°139/2009 &nbsp;·&nbsp; 5.000+ tacógrafos &nbsp;·&nbsp; 1.000+ buses
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 28, alignItems: 'center', fontSize: 14, fontWeight: 500 }}>
            <a href="./Contacto.html?topic=SACEL" style={{ color: p.ink, textDecoration: 'none', borderBottom: `1px solid ${copper}`, paddingBottom: 4 }}>Agendar demostración →</a>
            <a href="#specs" style={{ color: p.inkSub, textDecoration: 'none', borderBottom: `1px solid ${p.inkFaint}`, paddingBottom: 4 }}>Ver hoja técnica</a>
          </div>
        </div>
        <div style={{ background: p.surface, border: `1px solid ${p.inkFaint}`, padding: 36 }}>
          <div style={{ ...mono, fontSize: 10.5, color: p.inkDim, letterSpacing: '0.18em', marginBottom: 20, fontWeight: 500 }}>— Arquitectura SACEL</div>
          <ArchDiagram accent={copper}/>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, paddingTop: 20, borderTop: `1px solid ${p.inkFaint}` }}>
            {[['Flotas','140+'],['Conductores','12.400'],['Uptime','99,94%']].map(([k,v],i)=>(
              <div key={i}>
                <div style={{ ...mono, fontSize: 10, color: p.inkDim, letterSpacing: '0.14em' }}>{k}</div>
                <div style={{ ...(theme.displayEditorial || display), fontSize: 22, color: p.ink }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionHead theme={theme} num="02" eyebrow="Capacidades" title="Lo que hace" border/>
      <div style={{ padding: `20px ${pad}px 60px`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          ['Reportes DT-24', 'Emisión automática para Dirección del Trabajo. Auditoría firmada.'],
          ['Art. 25 monitor', 'Detección de infracciones en tiempo real. Alertas al operador.'],
          ['Mantenciones', 'Programación por km/horas. Órdenes de trabajo al taller.'],
          ['Geo-fencing', 'Rutas autorizadas, desvíos, paradas no planificadas.'],
          ['Horas extraordinarias', 'Cálculo automático por conductor. Exportable a nómina.'],
          ['API abierta', 'Integración a ERP/TMS existentes. REST + webhooks.'],
        ].map(([t, d], i) => (
          <div key={i} style={{ padding: 24, background: p.surface, borderLeft: `2px solid ${copper}` }}>
            <h3 style={{ margin: 0, ...display, fontSize: 20, letterSpacing: '-0.015em' }}>{t}</h3>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: p.inkSub, lineHeight: 1.55 }}>{d}</p>
          </div>
        ))}
      </div>

      <SectionHead theme={theme} num="03" eyebrow="Specs" title="Detalles técnicos" border/>
      <div id="specs" style={{ padding: `20px ${pad}px 100px` }}>
        <SpecTable theme={theme} rows={[
          ['Despliegue', 'Cloud multi-tenant · opción on-prem para clientes enterprise'],
          ['Uptime SLA', '99.9% · réplica activa'],
          ['Protocolos', 'HTTPS · MQTT sobre TLS · webhooks'],
          ['API', 'REST v2 · OAuth 2.0'],
          ['Reportes', 'PDF firmado · CSV · JSON · DT-24 oficial'],
          ['Roles', 'Operador · supervisor · auditor · admin'],
          ['Idiomas', 'Español (CL, AR, PE)'],
          ['Compatibilidad', 'Tacógrafo 4.0 · tacógrafos compatibles DT N°139/2009'],
        ]}/>
      </div>

      <CTABand theme={theme}
        title="¿Evaluamos SACEL en tu operación?"
        accentWord="tu operación"
        primary={{ label: 'Agendar demo', href: './Contacto.html?topic=SACEL' }}
        secondary={{ label: 'Ver Tacógrafo 4.0', href: './Tacografo-4.0.html' }}
      />
    </PageShell>
  );
}
window.SistemaSACEL = SistemaSACEL;
