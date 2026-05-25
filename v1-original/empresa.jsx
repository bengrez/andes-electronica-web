// Empresa.jsx — Andes Electrónica "Empresa" subpage
// Hero + manifesto · Scroll-reactive vertical timeline · Capacidades · CTA

function Empresa({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const pad = 72;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: p.bg, backgroundAttachment: 'fixed', color: p.ink, ...body, position: 'relative' }}>
      <GridOverlay palette={theme.palette}/>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <TopNav theme={theme} current="empresa" pad={pad}/>

        {/* ─── HERO / MANIFESTO ─── */}
        <section style={{ padding: `64px ${pad}px 56px`, position: 'relative' }}>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 28, fontWeight: 500 }}>
            — Empresa · Quiénes somos
          </div>
          <h1 style={{ margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.025em', maxWidth: 1000, fontWeight: 600 }}>
            Ingeniería electrónica chilena que <span style={{ color: copper }}>diseña, fabrica y mantiene</span> sus propios productos desde 1991.
          </h1>
          <div style={{ marginTop: 32, height: 1, width: 96, background: copper }}/>
          <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'start' }}>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: p.inkSub, maxWidth: 600 }}>
              Hardware y firmware propios para transporte, minería, defensa y telecomunicaciones. No revendemos equipos: diseñamos cada circuito, escribimos cada línea de firmware y damos soporte directo con ingenieros en Chile.
            </p>
            <div style={{ borderLeft: `1px solid ${p.inkFaint}`, paddingLeft: 24 }}>
              <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.22em', color: p.inkDim, textTransform: 'uppercase', marginBottom: 12, fontWeight: 500 }}>Misión</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: p.ink }}>
                Entregar ingeniería confiable, con respuesta local, a operaciones críticas en Chile. Hardware nuestro, firmware nuestro, soporte aquí.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 40, ...mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.inkDim, fontWeight: 500 }}>
            ISO 9001 &nbsp;·&nbsp; Res. DT N°139/2009 &nbsp;·&nbsp; Res. Exenta N°1081 — DT
          </div>
        </section>

        {/* ─── STATS STRIP (shared component — also rendered on Home) ─── */}
        <StatsStrip theme={theme} pad={pad}/>

        {/* ─── HISTORIA · canonical paragraph + historic logo ─── */}
        <section style={{ padding: `100px ${pad}px 60px`, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 72, alignItems: 'start' }}>
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', fontWeight: 500, marginBottom: 18 }}>— Historia</div>
              <h2 style={{ margin: 0, ...display, fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.03em', maxWidth: 720, fontWeight: 600 }}>
                Una empresa de servicios, especializada en <span style={{ color: copper }}>soluciones tecnológicas</span>.
              </h2>
              <div style={{ marginTop: 28, height: 1, width: 64, background: copper }}/>
              <p style={{ margin: '24px 0 0', fontSize: 16, lineHeight: 1.7, color: p.inkSub, maxWidth: 680 }}>
                Enrique Morchio y Cía. Ltda., bajo el nombre de Andes Electrónica, inició sus actividades el 1° de diciembre de 1991, cubriendo Desarrollo e Investigación en Electrónica, diseño de circuitos electrónicos, servicios de instalación y mantenimiento de equipos, y fabricación de soluciones electrónicas.
              </p>
              <p style={{ margin: '20px 0 0', fontSize: 16, lineHeight: 1.7, color: p.inkSub, maxWidth: 680 }}>
                Andes Electrónica se formó como empresa de servicios, especializada en soluciones tecnológicas tanto para productos de clientes como para desarrollos propios — Sistemas Fiscales y Tacógrafos Electrónicos. Actualmente posee el equipamiento para actividades de I+D en minería, transporte, retail, defensa, universidades, entre otros, y desarrolla fabricación de equipos electrónicos, diseño de circuitos, soporte técnico, asesorías, sistemas de control automático y reingeniería, además de instalación y puesta en marcha de centrales de telefonía fija, móvil y equipos wireless.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ border: `1px solid ${p.inkFaint}`, padding: 24, background: p.surface }}>
                <div style={{ ...mono, fontSize: 10, letterSpacing: '0.22em', color: copper, textTransform: 'uppercase', fontWeight: 500, marginBottom: 16 }}>— Identidad histórica</div>
                <img src="assets/logos/AE-logo-historico.png" alt="Logo histórico de Andes Electrónica"
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 2 }}/>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TIMELINE ─── vertical, scroll-reactive */}
        <VerticalTimeline theme={theme} pad={pad}/>

        {/* ─── RUBROS ATENDIDOS ─── */}
        <section style={{ padding: `100px ${pad}px 60px`, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, marginBottom: 48 }}>
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', fontWeight: 500, marginBottom: 18 }}>— Rubros atendidos</div>
              <h2 style={{ margin: 0, ...display, fontSize: 44, lineHeight: 1.08, letterSpacing: '-0.03em', fontWeight: 600 }}>
                Seis sectores, una misma <span style={{ color: copper }}>ingeniería</span>.
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: p.inkSub, alignSelf: 'end', maxWidth: 580 }}>
              Hemos construido capacidades específicas para cada sector — desde la normativa del transporte público hasta los protocolos de comunicación industriales de la minería.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: p.inkFaint, border: `1px solid ${p.inkFaint}` }}>
            {[
              ['Transporte', 'Tacógrafos, SACEL y telemetría para flotas de buses y camiones.'],
              ['Minería', 'Electrónica especializada y reingeniería de equipamiento industrial.'],
              ['Defensa', 'Hardware dedicado, sistemas legacy y mantención de electrónica especializada.'],
              ['Telecomunicaciones', 'Instalación y puesta en marcha de centrales fija, móvil y equipos wireless.'],
              ['Retail', 'Sistemas de control y automatización para operaciones comerciales.'],
              ['Universidades', 'Proyectos académicos, prototipado y desarrollo a medida.'],
            ].map(([t, d], i) => (
              <div key={i} style={{ background: p.surface, padding: '28px 28px', minHeight: 160 }}>
                <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.22em', color: copper, marginBottom: 14, fontWeight: 500 }}>{String(i+1).padStart(2,'0')}</div>
                <h3 style={{ margin: 0, ...display, fontSize: 22, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{t}</h3>
                <p style={{ margin: '10px 0 0', fontSize: 14, color: p.inkSub, lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CAPACIDADES ─── */}
        <section style={{ padding: `120px ${pad}px 80px`, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, marginBottom: 48 }}>
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 18 }}>— Capacidades</div>
              <h2 style={{ margin: 0, ...display, fontSize: 52, lineHeight: 1, letterSpacing: '-0.035em' }}>
                Qué hacemos<br/>
                <span style={{ color: copper }}>bajo el mismo techo.</span>
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6, color: p.inkSub, alignSelf: 'end', maxWidth: 620 }}>
              Un equipo integrado de ingenieros electrónicos, firmware, backend y soporte técnico que cubre el ciclo completo — desde el diseño del PCB hasta la operación en terreno de flotas con miles de vehículos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1, background: p.inkFaint, border: `1px solid ${p.inkFaint}` }}>
            {[
              { n: '01', t: 'Diseño electrónico', d: 'PCBs de alta densidad, ruteo mixto analógico/digital, simulación y validación por ciclos térmicos y EMI.', details: ['Altium · KiCad', 'Prototipado propio', 'Simulación SPICE'] },
              { n: '02', t: 'Fabricación y ensamble', d: 'Producción de series unitarias e industriales. Programación de firmware en planta, pruebas funcionales completas.', details: ['SMT · THT', 'Unit y batch', 'QA por unidad'] },
              { n: '03', t: 'Firmware & Backend', d: 'Firmware embebido en C / C++, plataformas web con Node y bases de datos relacionales. Uplink 4G con cifrado.', details: ['C/C++ embebido', 'Node · PostgreSQL', 'Telemetría MQTT'] },
              { n: '04', t: 'Operación en terreno', d: 'Red propia de instaladores y técnicos de servicio en regiones. Atención presencial, visitas programadas y de emergencia.', details: ['Santiago · Regiones', 'SLA definidos', 'Stock de repuestos'] },
              { n: '05', t: 'Certificación & Cumplimiento', d: 'Acompañamiento en procesos de certificación DT, ISO y sectoriales. Operador autorizado para normativas de transporte.', details: ['DT N°139/2009', 'ISO 9001', 'Res. 1081/2005'] },
              { n: '06', t: 'Investigación y Desarrollo', d: 'Proyectos a medida para industria, minería y defensa. Reingeniería y electrónica especializada de baja escala.', details: ['Control automático', 'Reingeniería', 'Proyectos académicos'] },
            ].map((c, i) => (
              <CapabilityCard key={i} c={c} theme={theme}/>
            ))}
          </div>
        </section>

        {/* ─── CTA / CONTACTO ─── */}
        <section id="contacto" style={{ background: copper, color: p.onAccent, padding: `100px ${pad}px`, position: 'relative', overflow: 'hidden', zIndex: 2 }}>
          <div style={{ position: 'absolute', right: -100, top: -100, width: 400, height: 400, border: '1px solid rgba(10,26,38,0.15)', borderRadius: '50%' }}/>
          <div style={{ position: 'absolute', right: 40, top: 40, width: 200, height: 200, border: '1px solid rgba(10,26,38,0.15)', borderRadius: '50%' }}/>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18, color: p.onAccent }}>— Trabajemos juntos</div>
              <h2 style={{ margin: 0, ...display, fontSize: 64, letterSpacing: '-0.045em', lineHeight: 0.98, maxWidth: 780 }}>
                ¿Un proyecto que requiere<br/>electrónica seria?
              </h2>
              <p style={{ margin: '22px 0 0', fontSize: 17, maxWidth: 560, color: 'rgba(10,26,38,0.75)', lineHeight: 1.5 }}>
                Visita, conversación directa, propuesta técnica escrita. Así trabajamos.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
              <a style={{ background: p.onAccent, color: '#fff', padding: '18px 32px', fontWeight: 600, fontSize: 14.5, textDecoration: 'none', borderRadius: 2, textAlign: 'center' }}>contacto@andeselec.com</a>
              <a style={{ border: `1px solid ${p.onAccent}`, color: p.onAccent, padding: '18px 32px', fontWeight: 600, fontSize: 14.5, textDecoration: 'none', borderRadius: 2, textAlign: 'center' }}>+56 2 2347 8700</a>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.14em', color: 'rgba(10,26,38,0.65)', marginTop: 6, textAlign: 'center' }}>Carmen Covarrubias 398 · Ñuñoa</div>
            </div>
          </div>
        </section>

        <SiteFooter theme={theme} pad={pad}/>
      </div>
    </div>
  );
}

// ─── Capability Card with hover detail reveal
function CapabilityCard({ c, theme }) {
  const { p, copper, display, mono } = theme;
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? (theme.palette === 'light' ? '#ede9df' : '#0a2a3c') : p.surface,
        padding: 40, minHeight: 280,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        cursor: 'pointer', transition: 'background .25s',
      }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: '0.22em', color: copper }}>{c.n}</div>
          <div style={{ ...mono, fontSize: 9, letterSpacing: '0.18em', color: p.inkDim }}>→</div>
        </div>
        <h3 style={{ margin: 0, ...display, fontSize: 26, lineHeight: 1.12, letterSpacing: '-0.02em' }}>{c.t}</h3>
        <p style={{ margin: '14px 0 0', fontSize: 14, color: p.inkSub, lineHeight: 1.6 }}>{c.d}</p>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {c.details.map((d, i) => (
          <span key={i} style={{
            ...mono, fontSize: 10.5, letterSpacing: '0.08em',
            padding: '6px 10px', border: `1px solid ${p.inkFaint}`,
            color: p.inkSub,
            background: hover ? `${copper}15` : 'transparent',
            transition: 'background .25s',
          }}>{d}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Vertical scroll-reactive timeline
function VerticalTimeline({ theme, pad }) {
  const { p, copper, display, mono } = theme;
  const milestones = [
    {
      year: '1991',
      tag: 'Fundación',
      title: 'Inicia Andes Electrónica.',
      body: 'Enrique Morchio y Cía. Ltda., bajo el nombre de Andes Electrónica, inicia sus actividades el 1° de diciembre de 1991. Cubre Desarrollo e Investigación en Electrónica, diseño de circuitos, servicios de instalación y mantenimiento, y fabricación de soluciones electrónicas.',
      meta: ['1° dic 1991 · Santiago, Chile', 'Enrique Morchio y Cía. Ltda.', 'Empresa de servicios e ingeniería'],
    },
    {
      year: '2004',
      tag: 'Normativa de transporte',
      title: 'Res. Exenta N° 1081 — Dirección del Trabajo · Decreto 80 — MTT.',
      body: 'La autoridad establece el marco regulatorio para el control electrónico de jornada en transporte de carga y pasajeros. Andes Electrónica desarrolla equipos y sistemas que cumplen estas normativas.',
      meta: ['Res. Exenta N° 1081 — DT', 'Decreto 80 — MTT', 'Cumplimiento desde su entrada en vigencia'],
    },
    {
      year: '2006',
      tag: 'Resolución N°100',
      title: 'Res. N° 100 — Ministerio de Transportes y Telecomunicaciones.',
      body: 'Se complementa el marco normativo para sistemas de control de jornada de transporte público y carga. Andes Electrónica adapta sus equipos al nuevo marco.',
      meta: ['Res. N° 100 — MTT', 'Cumplimiento normativo', 'Tacógrafos certificados'],
    },
    {
      year: '2009',
      tag: 'Certificación SACEL',
      title: 'Res. N° 139/2009 — Operador SACEL autorizado.',
      body: 'El 2 de febrero de 2009 la Dirección del Trabajo certifica a Andes Electrónica como operador del Sistema Automatizado de Control de Asistencia y Locomoción. Nace formalmente la plataforma SACEL.',
      meta: ['Res. N° 139 — DT', '2 feb 2009', 'Plataforma SACEL'],
    },
    {
      year: '2012',
      tag: 'Turbus SpA',
      title: 'Inicio de operación con Turbus SpA.',
      body: 'Turbus SpA adopta el Sistema SACEL como referente del control de jornada y telemetría de flota. Marca el inicio del despliegue del sistema en operadores interurbanos de mayor escala.',
      meta: ['Diciembre 2012', 'Cliente de referencia', 'Operador interurbano'],
    },
    {
      year: 'Hoy',
      tag: 'Ingeniería chilena',
      title: 'Hardware, firmware y soporte propios desde Santiago.',
      body: 'Seguimos siendo una empresa de ingeniería — no un distribuidor. Diseñamos, fabricamos y damos soporte a nuestros productos. Atendemos transporte, minería, defensa, telecomunicaciones, retail y universidades con monitoreo de flotas a nivel nacional.',
      meta: ['ISO 9001 vigente', 'Empresa Chilena', 'Operación a nivel nacional'],
    },
  ];

  return (
    <section style={{ padding: `120px ${pad}px 40px`, position: 'relative', zIndex: 2 }}>
      <div style={{ marginBottom: 80, maxWidth: 860 }}>
        <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', fontWeight: 500, marginBottom: 18 }}>— Historia</div>
        <h2 style={{ margin: 0, ...display, fontSize: 56, lineHeight: 1.04, letterSpacing: '-0.04em' }}>
          +30 años <span style={{ color: copper }}>construyendo</span> en Chile.
        </h2>
      </div>

      <div style={{ position: 'relative' }}>
        {/* vertical spine */}
        <div style={{ position: 'absolute', left: 369, top: 0, bottom: 0, width: 2, background: p.inkFaint }}/>
        {/* progress fill */}
        <TimelineSpine copper={copper} p={p}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
          {milestones.map((m, i) => (
            <Milestone key={i} m={m} theme={theme} isLast={i === milestones.length - 1}/>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Timeline progress spine that fills based on scroll position of the section
function TimelineSpine({ copper, p }) {
  const ref = React.useRef(null);
  const [fill, setFill] = React.useState(0);
  React.useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const update = () => {
      const rect = parent.getBoundingClientRect();
      const vh = window.innerHeight;
      // when section top hits viewport center -> 0% filled; when bottom passes center -> 100%
      const startY = rect.top - vh * 0.5;
      const endY = rect.bottom - vh * 0.5;
      const total = -startY + endY; // total range
      const passed = -startY; // amount past start
      let f = passed / total;
      if (rect.top > vh * 0.5) f = 0;
      if (rect.bottom < vh * 0.5) f = 1;
      f = Math.max(0, Math.min(1, f));
      setFill(f);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return (
    <div ref={ref} style={{
      position: 'absolute', left: 369, top: 0, width: 2,
      height: `${fill * 100}%`,
      background: `linear-gradient(to bottom, ${copper}, ${copper}cc)`,
      boxShadow: `0 0 18px ${copper}66`,
      transition: 'height 0.12s linear',
    }}/>
  );
}

// ─── Individual milestone with IntersectionObserver reveal
function Milestone({ m, theme, isLast }) {
  const { p, copper, display, mono } = theme;
  const ref = React.useRef(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(true); });
    }, { threshold: 0.3, rootMargin: '0px 0px -20% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      display: 'grid', gridTemplateColumns: '220px 120px 60px 1fr',
      gap: 0, alignItems: 'start',
      opacity: active ? 1 : 0.15,
      transform: active ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity .7s ease, transform .7s ease',
      minHeight: 280,
    }}>
      {/* image column — placeholder for hito visual */}
      <div style={{ paddingRight: 16, paddingTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          width: 180, height: 120,
          border: `1px dashed ${active ? copper + '66' : p.inkFaint}`,
          background: active ? `${copper}08` : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .5s ease',
        }}>
          <span style={{ ...mono, fontSize: 9, letterSpacing: '0.18em', color: p.inkDim, textTransform: 'uppercase' }}>
            Imagen · {m.year}
          </span>
        </div>
      </div>

      {/* year column */}
      <div style={{ textAlign: 'right', paddingRight: 20, paddingTop: 4 }}>
        <div style={{ ...display, fontSize: 44, lineHeight: 1, color: active ? p.ink : p.inkDim, letterSpacing: '-0.04em', transition: 'color .5s' }}>{m.year}</div>
        <div style={{ ...mono, fontSize: 10, letterSpacing: '0.18em', color: copper, textTransform: 'uppercase', marginTop: 8 }}>{m.tag}</div>
      </div>

      {/* dot column */}
      <div style={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', paddingTop: 14 }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: active ? copper : p.surface,
          border: `2px solid ${active ? copper : p.inkFaint}`,
          boxShadow: active ? `0 0 0 6px ${copper}22, 0 0 22px ${copper}55` : 'none',
          transition: 'all .6s ease',
          zIndex: 2,
        }}/>
      </div>

      {/* content column */}
      <div style={{ paddingLeft: 20, paddingBottom: isLast ? 0 : 20 }}>
        <div style={{
          background: active ? p.surface : 'transparent',
          border: `1px solid ${active ? copper + '44' : p.inkFaint}`,
          padding: 32, transition: 'all .5s ease',
        }}>
          <h3 style={{ margin: 0, ...display, fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.025em', color: p.ink }}>
            {m.title}
          </h3>
          <p style={{ margin: '18px 0 0', fontSize: 15.5, lineHeight: 1.65, color: p.inkSub }}>
            {m.body}
          </p>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 20, borderTop: `1px solid ${p.inkFaint}` }}>
            {m.meta.map((x, i) => (
              <span key={i} style={{ ...mono, fontSize: 11, letterSpacing: '0.08em', color: p.inkDim }}>
                <span style={{ color: copper, marginRight: 8 }}>●</span>{x}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Empresa = Empresa;
