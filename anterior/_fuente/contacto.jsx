// CONTACTO — Andes Electrónica · Deep Teal Editorial
function Contacto({ palette = 'deep-teal', accent = 'copper', typeface = 'inter' } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const pad = 72;

  // Valid topic values must match exactly what the segmented chips render below
  // — if the URL param doesn't match, we fall back to the default.
  const TOPICS = ['SACEL', 'Tacógrafo 4.0', 'Visor VI7GPS', 'Servicio técnico', 'I+D / Diseño', 'Otro'];
  // Read ?topic=... from the URL once on mount. Pages elsewhere on the site
  // build CTAs like "./Contacto.html?topic=SACEL" so the form lands with the
  // user's inquiry pre-selected — no re-clicking the chip after redirect.
  const initialTopic = React.useMemo(() => {
    if (typeof window === 'undefined') return 'SACEL';
    try {
      const raw = new URLSearchParams(window.location.search).get('topic');
      if (raw && TOPICS.includes(raw)) return raw;
    } catch {}
    return 'SACEL';
  }, []);

  const [form, setForm] = React.useState({
    name: '', company: '', email: '', phone: '', topic: initialTopic, topicOther: '', fleet: '', message: ''
  });
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent

  const submit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1100);
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const input = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `1px solid ${p.inkFaint}`,
    color: p.ink, padding: '14px 0', fontSize: 15, outline: 'none',
    ...body, transition: 'border-color .2s',
  };
  const label = { ...mono, fontSize: 10, letterSpacing: '0.18em', color: p.inkDim, textTransform: 'uppercase', marginBottom: 4 };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: p.bg, backgroundAttachment: 'fixed', color: p.ink, ...body, position: 'relative' }}>
      <GridOverlay palette={palette}/>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopNav theme={theme} current="contacto" pad={pad}/>

        {/* ─── HERO ─── */}
        <section style={{ padding: `64px ${pad}px 48px` }}>
          <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 28, fontWeight: 500 }}>
            — Contacto
          </div>
          <h1 style={{ margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: '-0.025em', maxWidth: 1000, fontWeight: 600 }}>
            Para cotizaciones, soporte técnico y proyectos de ingeniería <span style={{ color: copper }}>a medida</span>.
          </h1>
          <div style={{ marginTop: 32, height: 1, width: 96, background: copper }}/>
          <p style={{ margin: '28px 0 0', fontSize: 17, lineHeight: 1.6, color: p.inkSub, maxWidth: 640 }}>
            Respondemos en menos de 24 horas hábiles con una propuesta concreta. Atención directa de un ingeniero — sin formularios genéricos ni intermediarios comerciales.
          </p>
          <div style={{ marginTop: 32, ...mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: p.inkDim, fontWeight: 500 }}>
            Santiago de Chile &nbsp;·&nbsp; Lun – Vie 08:30 – 18:00 &nbsp;·&nbsp; Soporte 24/7 para clientes con contrato
          </div>
        </section>

        {/* ─── FORM + SIDEBAR ─── */}
        <section style={{ padding: `40px ${pad}px 100px`, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 72, alignItems: 'start' }}>
          {/* Form */}
          <div style={{ background: 'rgba(8,32,47,0.4)', border: `1px solid ${p.inkFaint}`, padding: 48, backdropFilter: 'blur(6px)' }}>
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${copper}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 12L10 17L20 7" stroke={copper} strokeWidth="2.5" strokeLinecap="square"/></svg>
                </div>
                <h2 style={{ margin: 0, ...display, fontSize: 44, letterSpacing: '-0.03em' }}>Mensaje recibido.</h2>
                <p style={{ margin: '16px auto 0', fontSize: 16, color: p.inkSub, maxWidth: 440, lineHeight: 1.55 }}>
                  Un ingeniero de Andes Electrónica revisará tu solicitud y responderá a <span style={{ color: copper }}>{form.email || 'tu correo'}</span> en menos de 24 horas hábiles.
                </p>
                <div style={{ ...mono, fontSize: 11, letterSpacing: '0.16em', color: p.inkDim, marginTop: 28, textTransform: 'uppercase' }}>
                  Ref · AE-{new Date().getTime().toString(36).toUpperCase().slice(-6)}
                </div>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, paddingBottom: 16, borderBottom: `1px solid ${p.inkFaint}` }}>
                  <div style={{ ...mono, fontSize: 11, letterSpacing: '0.2em', color: copper, textTransform: 'uppercase' }}>● FORMULARIO DE CONTACTO</div>
                  <div style={{ ...mono, fontSize: 10, letterSpacing: '0.14em', color: p.inkDim }}>CIFRADO · TLS 1.3</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>
                  <div>
                    <div style={label}>01 — Nombre</div>
                    <input style={input} value={form.name} onChange={update('name')} required placeholder="Ej. María González"/>
                  </div>
                  <div>
                    <div style={label}>02 — Empresa</div>
                    <input style={input} value={form.company} onChange={update('company')} placeholder="Empresa o flota"/>
                  </div>
                  <div>
                    <div style={label}>03 — Correo</div>
                    <input type="email" style={input} value={form.email} onChange={update('email')} required placeholder="correo@empresa.cl"/>
                  </div>
                  <div>
                    <div style={label}>04 — Teléfono</div>
                    <input style={input} value={form.phone} onChange={update('phone')} placeholder="+56 9 ..."/>
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div style={label} id="topic-label">05 — Tema de interés</div>
                  {/* Native radio group hidden visually but available to screen readers
                      and keyboard users; the visible chips below double as <label>s so
                      clicking a chip toggles its radio. role="radiogroup" gives AT a
                      single container to navigate. */}
                  <div role="radiogroup" aria-labelledby="topic-label"
                       style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {TOPICS.map(t => {
                      const id = `topic-${t.replace(/[^a-z0-9]/gi, '')}`;
                      const checked = form.topic === t;
                      return (
                        <label key={t} htmlFor={id} style={{
                          ...mono, fontSize: 11, letterSpacing: '0.08em', padding: '9px 14px',
                          background: checked ? copper : 'transparent',
                          border: `1px solid ${checked ? copper : p.inkFaint}`,
                          color: checked ? p.onAccent : p.inkSub,
                          cursor: 'pointer', borderRadius: 2, fontWeight: 500,
                          display: 'inline-flex', alignItems: 'center',
                          transition: 'background .15s, border-color .15s, color .15s',
                        }}>
                          <input type="radio" name="topic" id={id} value={t}
                            checked={checked}
                            onChange={() => setForm({ ...form, topic: t })}
                            style={{
                              // Visually hidden but focusable — accessible-but-styled radio.
                              position: 'absolute', width: 1, height: 1, margin: -1,
                              padding: 0, border: 0, clip: 'rect(0 0 0 0)', overflow: 'hidden',
                            }}/>
                          {t}
                        </label>
                      );
                    })}
                  </div>
                  {/* When the user picks "Otro" we expand a free-text field so the
                      consulta doesn't land vague. Hidden when any specific topic is
                      selected — the chip + free text together replace what a generic
                      dropdown would have done. */}
                  {form.topic === 'Otro' && (
                    <div style={{ marginTop: 16 }}>
                      <input
                        style={input}
                        value={form.topicOther || ''}
                        onChange={update('topicOther')}
                        placeholder="¿Sobre qué necesitas hablar? Ej. integración con un ERP, repuestos para un equipo antiguo…"
                        aria-label="Describe brevemente tu consulta"
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div style={label} id="fleet-label">06 — Tamaño de flota / operación (opcional)</div>
                  <div role="radiogroup" aria-labelledby="fleet-label"
                       style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {['< 10', '10–50', '50–200', '200–500', '500+', 'N/A'].map(t => {
                      const id = `fleet-${t.replace(/[^a-z0-9]/gi, '')}`;
                      const checked = form.fleet === t;
                      return (
                        <label key={t} htmlFor={id} style={{
                          ...mono, fontSize: 11, letterSpacing: '0.06em', padding: '9px 14px',
                          background: checked ? 'rgba(192,125,46,0.14)' : 'transparent',
                          border: `1px solid ${checked ? copper : p.inkFaint}`,
                          color: checked ? copper : p.inkSub,
                          cursor: 'pointer', borderRadius: 2, fontWeight: 500,
                          display: 'inline-flex', alignItems: 'center',
                          transition: 'background .15s, border-color .15s, color .15s',
                        }}>
                          <input type="radio" name="fleet" id={id} value={t}
                            checked={checked}
                            onChange={() => setForm({ ...form, fleet: t })}
                            style={{ position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, border: 0, clip: 'rect(0 0 0 0)', overflow: 'hidden' }}/>
                          {t}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <div style={label}>07 — Mensaje</div>
                  <textarea
                    style={{ ...input, minHeight: 120, resize: 'vertical', paddingTop: 14, fontFamily: 'inherit' }}
                    value={form.message} onChange={update('message')} required
                    placeholder="Describe brevemente tu proyecto, normativa a cumplir, o situación actual..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div style={{ ...mono, fontSize: 10.5, letterSpacing: '0.14em', color: p.inkDim, maxWidth: 340 }}>
                    Al enviar aceptas nuestra política de privacidad. No compartimos datos con terceros.
                  </div>
                  <button type="submit" disabled={status === 'sending'} style={{
                    background: copper, color: p.onAccent, border: 'none',
                    padding: '16px 36px', fontSize: 14, fontWeight: 600,
                    letterSpacing: '0.02em', cursor: status === 'sending' ? 'wait' : 'pointer',
                    borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 10,
                    opacity: status === 'sending' ? 0.7 : 1, ...body,
                  }}>
                    {status === 'sending' ? 'Enviando…' : <>Enviar mensaje <span>→</span></>}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar — direct channels */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 16 }}>— Contacto directo</div>
              <h2 style={{ margin: 0, ...display, fontSize: 36, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                ¿Prefieres ir al grano?
              </h2>
            </div>

            {[
              { label: 'Correo',   value: 'contacto@andeselec.com', sub: 'Ventas, cotizaciones, soporte', href: 'mailto:contacto@andeselec.com', icon: '✉', iconLabel: 'Correo electrónico' },
              { label: 'Teléfono', value: '+56 2 2347 8700',         sub: 'Lun a Vie · 8:30 – 18:00',      href: 'tel:+56223478700',           icon: '☏', iconLabel: 'Teléfono' },
            ].map((c, i) => (
              <a key={i} href={c.href}
                aria-label={`${c.label}: ${c.value}`}
                style={{
                display: 'block', textDecoration: 'none', color: p.ink,
                borderLeft: `2px solid ${copper}`, paddingLeft: 20, paddingTop: 4, paddingBottom: 4,
                transition: 'padding-left .2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '26px'}
              onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '20px'}
              >
                <div style={{ ...mono, fontSize: 10, letterSpacing: '0.2em', color: p.inkDim, textTransform: 'uppercase', marginBottom: 6 }}>
                  <span aria-label={c.iconLabel} role="img">{c.icon}</span> &nbsp; {c.label}
                </div>
                <div style={{ ...display, fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500 }}>{c.value}</div>
                <div style={{ fontSize: 13, color: p.inkSub, marginTop: 4 }}>{c.sub}</div>
              </a>
            ))}
          </aside>
        </section>

        {/* ─── OFICINA + MAPA ─── */}
        <section style={{ background: p.surface, padding: `90px ${pad}px`, borderTop: `1px solid ${p.inkFaint}`, borderBottom: `1px solid ${p.inkFaint}`, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'start' }}>
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 16 }}>— Oficina central</div>
              <h2 style={{ margin: 0, ...display, fontSize: 56, letterSpacing: '-0.035em', lineHeight: 1 }}>
                Santiago, Chile.<br/><span style={{ color: copper }}>Ñuñoa.</span>
              </h2>
              <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr', gap: 22 }}>
                {[
                  ['Dirección', 'Carmen Covarrubias 398\nÑuñoa, Región Metropolitana\nChile'],
                  ['Horario', 'Lunes a Viernes\n8:30 – 18:00 hrs'],
                  ['Estacionamiento', 'Disponible para clientes\ncon cita previa'],
                ].map(([k, v]) => (
                  <div key={k} style={{ borderTop: `1px solid ${p.inkFaint}`, paddingTop: 14 }}>
                    <div style={{ ...mono, fontSize: 10, letterSpacing: '0.18em', color: p.inkDim, textTransform: 'uppercase', marginBottom: 8 }}>{k}</div>
                    <div style={{ fontSize: 15, color: p.ink, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{v}</div>
                  </div>
                ))}
              </div>
              <a href="https://maps.google.com/?q=Carmen+Covarrubias+398+Nunoa" target="_blank" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 36,
                color: copper, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                borderBottom: `1px solid ${copper}`, paddingBottom: 4,
              }}>
                Abrir en Google Maps <span>→</span>
              </a>
            </div>

            {/* Google Map — dark-filtered to match theme */}
            <div style={{ border: `1px solid ${p.inkFaint}`, background: p.surface2, aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
              <iframe
                title="Andes Electrónica — Carmen Covarrubias 398, Ñuñoa"
                src="https://www.google.com/maps?q=Carmen+Covarrubias+398,+%C3%91u%C3%B1oa,+Santiago,+Chile&z=16&hl=es&output=embed"
                width="100%" height="100%" frameBorder="0"
                style={{
                  border: 0,
                  width: '100%', height: '100%',
                  filter: palette === 'light' ? 'none' : 'invert(92%) hue-rotate(180deg) saturate(0.55) brightness(0.95) contrast(0.95)',
                }}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
              {/* copper pin overlay + label */}
              <div style={{ position: 'absolute', top: 12, left: 12, ...mono, fontSize: 10, letterSpacing: '0.16em', color: copper, background: p.deep + 'cc', padding: '6px 10px', border: `1px solid ${copper}`, textTransform: 'uppercase', pointerEvents: 'none' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: copper, marginRight: 8, verticalAlign: 'middle' }}/>
                Carmen Covarrubias 398 · Ñuñoa
              </div>
              <a href="https://www.google.com/maps/dir/?api=1&destination=Carmen+Covarrubias+398,+%C3%91u%C3%B1oa,+Santiago,+Chile"
                 target="_blank" rel="noopener"
                 style={{ position: 'absolute', bottom: 12, right: 12, ...mono, fontSize: 10, letterSpacing: '0.16em', color: p.onAccent, background: copper, padding: '8px 14px', textDecoration: 'none', textTransform: 'uppercase', fontWeight: 600 }}>
                Cómo llegar →
              </a>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section style={{ padding: `100px ${pad}px`, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 64, alignItems: 'start' }}>
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: '0.24em', color: copper, textTransform: 'uppercase', marginBottom: 16 }}>— Preguntas frecuentes</div>
              <h2 style={{ margin: 0, ...display, fontSize: 48, letterSpacing: '-0.035em', lineHeight: 1.02 }}>
                Antes de escribirnos, quizás esto ayude.
              </h2>
            </div>
            <FAQ theme={theme}/>
          </div>
        </section>

        <SiteFooter theme={theme} pad={pad}/>
      </div>
    </div>
  );
}

// ─── Stylized map showing Santiago / Ñuñoa
function StylizedMap({ copper, p, mono }) {
  return (
    <svg viewBox="0 0 600 450" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={p.inkFaint} strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="600" height="450" fill={p.surface2}/>
      <rect width="600" height="450" fill="url(#mapgrid)"/>

      {/* main roads */}
      <g stroke={p.inkDim} strokeWidth="1.2" fill="none" opacity="0.6">
        <path d="M 0 180 Q 150 170, 300 220 T 600 260"/>
        <path d="M 0 320 Q 180 300, 350 340 T 600 380"/>
        <path d="M 80 0 Q 120 150, 250 230 T 380 450"/>
        <path d="M 450 0 Q 430 140, 380 230 T 320 450"/>
      </g>
      {/* minor roads */}
      <g stroke={p.inkFaint} strokeWidth="0.6" fill="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1="0" y1={45 * i} x2="600" y2={45 * i + 20}/>
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={50 * i} y1="0" x2={50 * i - 30} y2="450"/>
        ))}
      </g>
      {/* park / plaza shapes */}
      <ellipse cx="180" cy="140" rx="46" ry="30" fill={copper} fillOpacity="0.06" stroke={copper} strokeOpacity="0.3" strokeWidth="0.8"/>
      <rect x="440" y="90" width="70" height="50" fill={copper} fillOpacity="0.05" stroke={copper} strokeOpacity="0.2" strokeWidth="0.8"/>

      {/* Andes Electrónica pin */}
      <g transform="translate(310 235)">
        <circle r="48" fill={copper} fillOpacity="0.08" stroke={copper} strokeOpacity="0.35" strokeWidth="1"/>
        <circle r="22" fill={copper} fillOpacity="0.2" stroke={copper} strokeWidth="1"/>
        <circle r="6" fill={copper}/>
        <circle r="8" fill="none" stroke={copper} strokeWidth="1"/>
        <line x1="-80" y1="0" x2="-34" y2="0" stroke={copper} strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="2 3"/>
      </g>
      <g transform="translate(180 230)">
        <rect x="0" y="0" width="120" height="36" fill={p.surface} stroke={copper} strokeWidth="1"/>
        <text x="10" y="16" fontSize="9" fill={copper} fontFamily='"JetBrains Mono",monospace' letterSpacing="0.12em">● ANDES ELEC.</text>
        <text x="10" y="28" fontSize="7.5" fill={p.inkDim} fontFamily='"JetBrains Mono",monospace' letterSpacing="0.08em">CARMEN COVARRUBIAS 398</text>
      </g>

      {/* compass */}
      <g transform="translate(540 50)">
        <circle r="20" fill="none" stroke={p.inkDim} strokeWidth="0.8"/>
        <path d="M 0 -14 L 4 0 L 0 14 L -4 0 Z" fill={copper} stroke={copper} strokeWidth="0.5"/>
        <text y="-24" textAnchor="middle" fontSize="8" fill={p.inkDim} fontFamily='"JetBrains Mono",monospace' letterSpacing="0.1em">N</text>
      </g>

      {/* scale */}
      <g transform="translate(30 410)">
        <line x1="0" y1="0" x2="60" y2="0" stroke={p.inkDim} strokeWidth="1"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke={p.inkDim} strokeWidth="1"/>
        <line x1="60" y1="-4" x2="60" y2="4" stroke={p.inkDim} strokeWidth="1"/>
        <text x="0" y="18" fontSize="8" fill={p.inkDim} fontFamily='"JetBrains Mono",monospace'>0</text>
        <text x="50" y="18" fontSize="8" fill={p.inkDim} fontFamily='"JetBrains Mono",monospace'>500m</text>
      </g>
    </svg>
  );
}

// ─── FAQ accordion
function FAQ({ theme }) {
  const { p, copper, display, mono, body } = theme;
  const [open, setOpen] = React.useState(0);
  const items = [
    { q: '¿Cuánto tarda una instalación de SACEL en una flota nueva?',
      a: 'Para flotas de hasta 50 vehículos, completamos instalación y capacitación en 2–3 semanas. Flotas mayores se planifican por etapas. Incluye puesta en marcha, entrenamiento a operadores y 30 días de soporte dedicado.' },
    { q: '¿Son operador certificado por la Dirección del Trabajo?',
      a: 'Sí. Andes Electrónica es operador certificado bajo la Resolución DT N°139/2009 para sistemas electrónicos de control de asistencia y jornada. También contamos con certificación ISO 9001 vigente.' },
    { q: '¿Hacen desarrollo a medida o solo venden productos de línea?',
      a: 'Ambos. Desde 1991 desarrollamos electrónica aplicada para terceros: diseño de PCBs, firmware, ensamble y certificación. Atendemos tanto unitarios prototípicos como series industriales.' },
    { q: '¿Qué pasa si falla un tacógrafo instalado?',
      a: 'Si tienes contrato de soporte, nuestro servicio técnico responde en 24 horas hábiles (2 horas para emergencias críticas). Tenemos unidades de reemplazo inmediato para clientes con contrato activo.' },
    { q: '¿Atienden fuera de Santiago?',
      a: 'Sí. Tenemos técnicos certificados viajando regularmente a regiones. Para instalaciones grandes coordinamos presencia en terreno durante todo el roll-out.' },
  ];
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderTop: `1px solid ${p.inkFaint}`, ...(i === items.length - 1 ? { borderBottom: `1px solid ${p.inkFaint}` } : {}) }}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} style={{
              width: '100%', background: 'transparent', border: 'none',
              padding: '24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 20, cursor: 'pointer', color: p.ink, textAlign: 'left',
            }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <span style={{ ...mono, fontSize: 11, letterSpacing: '0.18em', color: copper, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ ...display, fontSize: 20, letterSpacing: '-0.02em', fontWeight: 500 }}>{it.q}</span>
              </div>
              <span style={{ ...mono, fontSize: 20, color: copper, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform .25s', flexShrink: 0 }}>+</span>
            </button>
            <div style={{
              maxHeight: isOpen ? 400 : 0, overflow: 'hidden',
              transition: 'max-height .35s ease, padding .25s',
              paddingLeft: 50, paddingBottom: isOpen ? 28 : 0, paddingRight: 40,
            }}>
              <p style={{ margin: 0, fontSize: 15.5, color: p.inkSub, lineHeight: 1.65, maxWidth: 720, ...body }}>{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.Contacto = Contacto;
