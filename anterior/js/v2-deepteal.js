// Generado desde v2-deepteal.jsx por compilar.mjs: no editar a mano.
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
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);
  return /* @__PURE__ */ React.createElement("span", { style: { color } }, /* @__PURE__ */ React.createElement("span", { key: idx, style: {
    display: "inline-block",
    animation: "rotEnter .42s cubic-bezier(0.16, 1, 0.3, 1) both"
  } }, variants[idx]));
}
function V2DeepTeal({ density = "comfortable", palette = "deep-teal", typeface = "inter", accent = "copper" }) {
  const pad = density === "compact" ? 40 : 72;
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const ink = p.ink;
  const [activeTab, setActiveTab] = React.useState(0);
  const [liveCount, setLiveCount] = React.useState(1847);
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
        const next = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
        setActiveTab((prev) => prev === next ? prev : next);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  React.useEffect(() => {
    const t = setInterval(() => setLiveCount((c) => 1840 + Math.floor(Math.random() * 20)), 2600);
    return () => clearInterval(t);
  }, []);
  const floatRef = React.useRef(null);
  const productsRef = React.useRef(null);
  const [logoPhase, setLogoPhase] = React.useState(0);
  React.useEffect(() => {
    let gestures = 0;
    let lastScrollTime = 0;
    let lastY = window.scrollY;
    let triggered = false;
    let phase1Timer = 0, phase2Timer = 0;
    const GESTURE_GAP = 280;
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
          window.removeEventListener("scroll", onScroll);
          phase1Timer = setTimeout(() => setLogoPhase(1), 0);
          phase2Timer = setTimeout(() => setLogoPhase(2), 900);
        }
      }
      lastScrollTime = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (phase1Timer) clearTimeout(phase1Timer);
      if (phase2Timer) clearTimeout(phase2Timer);
    };
  }, []);
  const updateFloatStyles = React.useCallback(() => {
    if (!floatRef.current) return;
    const y = window.scrollY;
    const offset = y * 0.18;
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
    window.addEventListener("scroll", onScroll, { passive: true });
    updateFloatStyles();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateFloatStyles]);
  return /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    minHeight: "100%",
    background: p.bg,
    // Lock the gradient to the viewport so it stays in lockstep with the
    // fixed-position hero PNG below. Without this, the gradient scrolls
    // with the document while the PNG stays glued to the viewport — you
    // see a subtle "drift" where two backgrounds slowly desync.
    backgroundAttachment: "fixed",
    color: ink,
    ...body,
    position: "relative"
  } }, /* @__PURE__ */ React.createElement(GridOverlay, { palette }), /* @__PURE__ */ React.createElement(TopNav, { theme, current: "home", pad }), /* @__PURE__ */ React.createElement("section", { style: { padding: `40px ${pad}px 64px`, position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement(SignalFlow, { theme, palette }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", maxWidth: 820, marginLeft: "auto", marginTop: 56 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 13, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", fontWeight: 500, marginBottom: 32 } }, "— Andes Electrónica · Santiago de Chile · Est. 1991"), /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: "-0.025em", fontWeight: 600 } }, "Treinta años de ", /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, "electrónica chilena"), " — diseñada en casa, renovada en cada generación."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 36, height: 1, width: 96, background: copper } }), /* @__PURE__ */ React.createElement("p", { style: { margin: "28px 0 0", fontSize: 21, lineHeight: 1.55, color: p.inkSub, maxWidth: 620, fontWeight: 400 } }, "Somos una empresa chilena de electrónica: diseñamos, fabricamos y mantenemos tacógrafos para buses y camiones, y ", /* @__PURE__ */ React.createElement("strong", { style: { color: copper, fontWeight: 700 } }, "SACEL"), ", nuestro sistema en línea para gestionar la flota."), /* @__PURE__ */ React.createElement("p", { style: { margin: "16px 0 0", fontSize: 21, lineHeight: 1.55, color: p.inkSub, maxWidth: 620, fontWeight: 400 } }, "Investigamos y desarrollamos en casa: cada versión del tacógrafo nace de lo que aprendemos en ruta. Esa misma ingeniería la ponemos al servicio de proyectos a medida, en Santiago desde 1991."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, ...mono, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: p.inkDim, fontWeight: 500 } }, "ISO 9001  ·  Res. DT N°139/2009  ·  Res. Exenta N°1081 — DT"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 44, display: "flex", gap: 36, alignItems: "center", fontSize: 17, fontWeight: 500 } }, /* @__PURE__ */ React.createElement("a", { href: "./Productos.html", style: { color: ink, textDecoration: "none", borderBottom: `1px solid ${copper}`, paddingBottom: 6, transition: `color ${theme.durBase} ${theme.ease}` } }, "Catálogo de productos →"), /* @__PURE__ */ React.createElement("a", { href: "./Empresa.html", style: { color: p.inkSub, textDecoration: "none", borderBottom: `1px solid ${p.inkFaint}`, paddingBottom: 6 } }, "Quiénes somos")))), palette !== "light" ? /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: floatRef,
      "aria-hidden": "true",
      className: "hero-bg-image",
      style: {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
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
        backgroundSize: "100vw auto",
        backgroundPosition: `calc(28vw - ${(820 + pad) / 2}px) 50%`,
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.85,
        willChange: "opacity, transform",
        // Dual-gradient mask: fade out to the right (so image dissolves before it
        // reaches the headline column) and to the bottom (so it blends into the
        // page bg as the next section approaches). Composited with `intersect`
        // so both fades apply simultaneously.
        WebkitMaskImage: "linear-gradient(to right, black 0%, black 42%, rgba(0,0,0,0.4) 70%, transparent 92%),linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.35) 82%, transparent 100%)",
        WebkitMaskComposite: "source-in",
        maskImage: "linear-gradient(to right, black 0%, black 42%, rgba(0,0,0,0.4) 70%, transparent 92%),linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.35) 82%, transparent 100%)",
        maskComposite: "intersect"
      }
    }
  ) : /* @__PURE__ */ React.createElement(HeroBgLight, { floatRef, pad, copper }), /* @__PURE__ */ React.createElement("section", { ref: productsRef, "data-products-section": true, style: { padding: `60px ${pad}px 160px`, minHeight: "300vh" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "sticky",
    top: 120,
    background: palette === "light" ? "rgba(223,217,203,0.5)" : "rgba(5,19,31,0.5)",
    padding: `36px ${pad}px 44px`,
    margin: `0 -${pad}px`
  } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 32, maxWidth: 860, marginLeft: "auto", textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 13, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", fontWeight: 500, marginBottom: 14 } }, "Productos destacados —"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.035em" } }, "Hardware nuestro, firmware nuestro,", /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, " soporte en español."))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, borderBottom: `1px solid ${p.inkFaint}`, marginBottom: 40 } }, [
    { num: "01", label: "Tacógrafo 4.0", sub: "Producto" },
    { num: "02", label: "Sistema SACEL", sub: "Plataforma" },
    { num: "03", label: "I+D & Software", sub: "A medida" },
    // ── RESERVED slot — hidden until project content arrives. To expose, remove the
    //    `reserved: true` flag and add the matching `activeTab === 3` content block below.
    { num: "04", label: "Proyecto en desarrollo", sub: "Próximamente", reserved: true }
  ].filter((t) => !t.reserved).map((t, i) => /* @__PURE__ */ React.createElement("button", { key: i, onClick: () => {
    const el = productsRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const travel = Math.max(1, rect.height - vh);
    const targetT = i === 0 ? 0.05 : i === 1 ? 0.45 : 0.78;
    const targetTop = window.scrollY + rect.top + targetT * travel;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }, style: {
    flex: 1,
    padding: "22px 24px",
    background: "transparent",
    border: "none",
    borderBottom: activeTab === i ? `2px solid ${copper}` : "2px solid transparent",
    color: activeTab === i ? ink : `${p.inkDim}`,
    textAlign: "left",
    cursor: "pointer",
    transition: "all .2s"
  } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 12, letterSpacing: "0.2em", color: activeTab === i ? copper : `${p.inkDim}` } }, t.num, " — ", t.sub.toUpperCase()), /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 26, marginTop: 8, fontWeight: 500, letterSpacing: "-0.02em" } }, t.label)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", { key: `tab-${activeTab}`, style: { animation: "tabFadeIn .5s ease both" } }, activeTab === 0 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: "-0.035em" } }, "Tacógrafo 4.0 — el registro que", /* @__PURE__ */ React.createElement("br", null), "la autoridad exige, y más."), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 20,
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    ...mono,
    fontSize: 12,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: copper,
    fontWeight: 600
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 28, height: 1, background: copper } }), "Tacógrafo digital certificado · Producto Andes"), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 24, fontSize: 19, lineHeight: 1.55, color: `${p.inkSub}` } }, "Caja negra certificada bajo Res. Exenta N°1081 — DT. Conexión CAN 2.0B al bus del vehículo, GNSS + 4G dual, 24 meses de memoria interna e identificación por SmartCard, todo en carcasa grado IP54. Diseñada, fabricada y soportada en Santiago."), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 32,
    border: `1px solid ${p.inkFaint}`,
    borderTop: `2px solid ${copper}`,
    background: `${p.inkFaint}`,
    padding: "22px 24px"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.22em", color: copper, textTransform: "uppercase", fontWeight: 600 } }, "Specs"), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10, letterSpacing: "0.14em", color: `${p.inkDim}` } }, "AE-T40 · REV 2.4")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", columnGap: 28, rowGap: 10 } }, [
    ["Certificación", "Res. Exenta N°1081 — DT"],
    ["Bus del vehículo", "CAN 2.0B"],
    ["Protección", "IP54"],
    ["Comunicaciones", "4G + GNSS dual"],
    ["Memoria", "24 meses"],
    ["SmartCard", "Conductor + Empresa"]
  ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 13.5,
    borderBottom: `1px dashed ${p.inkFaint}`,
    paddingBottom: 8
  } }, /* @__PURE__ */ React.createElement("span", { style: { ...mono, color: `${p.inkDim}`, letterSpacing: "0.04em", fontSize: 11.5, textTransform: "uppercase" } }, k), /* @__PURE__ */ React.createElement("span", { style: { color: ink, fontWeight: 500, textAlign: "right" } }, v))))), /* @__PURE__ */ React.createElement("a", { href: "./Tacografo-4.0.html", style: { marginTop: 32, display: "inline-block", color: copper, fontSize: 16, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${copper}`, paddingBottom: 4 } }, "Ver ficha técnica completa →")), activeTab === 1 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: "-0.035em" } }, "Sistema SACEL — del vehículo", /* @__PURE__ */ React.createElement("br", null), "al reporte, en una plataforma."), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 24, fontSize: 19, lineHeight: 1.6, color: `${p.inkSub}` } }, "Plataforma web para flotas con control de art. 25 del Código del Trabajo, bitácora de conductor, detección automática de infracciones y mantenciones programadas. Operador certificado por la Dirección del Trabajo."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, borderTop: `1px solid ${p.inkFaint}`, paddingTop: 24 } }, [
    ["Conductores monitoreados", "12.4k"],
    ["Seguimiento GPS · día", "2.8M"],
    ["Multas e informes · mes", "8.500"]
  ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 12, color: `${p.inkDim}`, letterSpacing: "0.18em", textTransform: "uppercase" } }, k), /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 40, color: ink, marginTop: 6, letterSpacing: "-0.03em" } }, v)))), /* @__PURE__ */ React.createElement("a", { href: "./Sistema-SACEL.html", style: { marginTop: 36, display: "inline-block", color: copper, fontSize: 16, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${copper}`, paddingBottom: 4 } }, "Entrar al demo →")), activeTab === 2 && // Tab 03 — positions the in-house R&D team as the bridge from catalog
  // products (Tacógrafo, SACEL) into bespoke software. Frames future
  // dashboard/analytics offerings as natural extensions of work already
  // happening, without inventing product names that don't exist yet.
  /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: "-0.035em" } }, "Si tu problema no está en el catálogo,", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, "lo diseñamos.")), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 24, fontSize: 19, lineHeight: 1.6, color: `${p.inkSub}` } }, "El mismo equipo que construyó SACEL y el Tacógrafo 4.0 toma tu operación como punto de partida. Extendemos SACEL con módulos propios, levantamos dashboards a medida o integramos con los sistemas que ya usas. Hardware, firmware y software bajo un mismo techo — sin APIs externas ni pagos a terceros."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 } }, [
    ["Dashboards a medida", "KPIs y vistas específicas de tu operación"],
    ["Extensiones SACEL", "Módulos nuevos sobre la plataforma base"],
    ["Integraciones", "API con tu ERP, BI o datawarehouse"],
    ["Prototipado rápido", "De idea a piloto funcional en semanas"]
  ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { borderLeft: `2px solid ${copper}`, paddingLeft: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 14, color: ink, fontWeight: 600 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: `${p.inkDim}`, marginTop: 4 } }, v)))), /* @__PURE__ */ React.createElement("a", { href: "./Investigacion-Desarrollo.html", style: { marginTop: 36, display: "inline-block", color: copper, fontSize: 16, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${copper}`, paddingBottom: 4 } }, "Conversemos tu proyecto →")), activeTab === 3 && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: copper, marginBottom: 18, fontWeight: 600 } }, "— 04 · Próximamente"), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 50, lineHeight: 1.04, letterSpacing: "-0.035em" } }, "Proyecto en desarrollo."), /* @__PURE__ */ React.createElement("p", { style: { marginTop: 24, fontSize: 19, lineHeight: 1.6, color: `${p.inkSub}` } }, "Estamos trabajando en una nueva iniciativa. Pronto compartiremos detalles — reservamos este espacio para contar la historia cuando esté lista."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, padding: 24, border: `1px dashed ${p.inkFaint}`, color: `${p.inkDim}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 } }, "Slot reservado"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14 } }, "Pendiente: brief de proyecto, especificaciones, gráficos y CTA.")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
    opacity: 0.75,
    transform: "scale(0.75)",
    transformOrigin: "center right",
    willChange: "transform, opacity"
  } }, /* @__PURE__ */ React.createElement(VehicleFlowViz, { theme, hostRef: productsRef })))))), /* @__PURE__ */ React.createElement("section", { "data-services-section": true, style: { padding: `80px ${pad}px 100px` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 13, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", fontWeight: 500, marginBottom: 16 } }, "— Capacidades"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 50, lineHeight: 1, letterSpacing: "-0.035em" } }, "Más que productos:", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, "ingeniería a pedido."))), /* @__PURE__ */ React.createElement("a", { style: { color: p.inkSub, fontSize: 15, textDecoration: "none", borderBottom: `1px solid ${p.inkDim}`, paddingBottom: 4 } }, "Ver todos los servicios →")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: p.inkFaint, border: `1px solid ${p.inkFaint}` } }, [
    { num: "01", t: "Instalaciones SACEL", d: "Puesta en marcha, capacitación y soporte técnico en todo Chile." },
    { num: "02", t: "Servicio Técnico", d: "Mantención preventiva y correctiva para tacógrafos y periféricos." },
    { num: "03", t: "Diseño & Fabricación", d: "PCBs, ensamble y certificación para unitarios o series industriales." },
    { num: "04", t: "Investigación & Desarrollo", d: "Control automático, reingeniería y electrónica aplicada a medida." }
  ].map((s, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      style: { background: p.surface, padding: 32, minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer", transition: "background .2s" },
      onMouseEnter: (e) => e.currentTarget.style.background = palette === "light" ? "#ede9df" : "#0a2a3c",
      onMouseLeave: (e) => e.currentTarget.style.background = p.surface
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 12, letterSpacing: "0.22em", color: copper, marginBottom: 28 } }, s.num), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.02em" } }, s.t), /* @__PURE__ */ React.createElement("p", { style: { margin: "16px 0 0", fontSize: 15, color: `${p.inkSub}`, lineHeight: 1.55 } }, s.d)),
    /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 13, color: copper, letterSpacing: "0.16em", marginTop: 20 } }, "VER SERVICIO →")
  )))), /* @__PURE__ */ React.createElement("section", { style: { padding: `0 ${pad}px 100px` } }, /* @__PURE__ */ React.createElement("div", { style: { borderTop: `1px solid ${p.inkFaint}`, paddingTop: 48, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 60, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 13, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", marginBottom: 14 } }, "— Industrias"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 48, lineHeight: 1.02, letterSpacing: "-0.03em" } }, "Donde resolvemos.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 } }, [
    ["Transporte", "Flotas de bus, camión y taxi. Cumplimiento DT + telemetría."],
    ["Minería", "Control ambiental, instrumentación y sistemas de comunicación."],
    ["Defensa", "Electrónica especializada con protocolos y confidencialidad."],
    ["Telecom", "Centrales fija y móvil, implementación de wireless."],
    ["Retail", "Sistemas de control y automatización industrial."],
    ["Universidades", "Reingeniería e I+D para proyectos académicos."]
  ].map(([t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: "22px 24px", borderLeft: i % 3 === 0 ? "none" : `1px solid ${p.inkFaint}`, borderTop: i >= 3 ? `1px solid ${p.inkFaint}` : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 24, letterSpacing: "-0.02em" } }, t), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: `${p.inkSub}`, marginTop: 8, lineHeight: 1.5 } }, d)))))), /* @__PURE__ */ React.createElement(StatsStrip, { theme, pad }), /* @__PURE__ */ React.createElement("section", { style: { padding: `24px ${pad}px`, background: palette === "light" ? "rgba(12,61,92,0.04)" : "rgba(0,0,0,0.28)", borderTop: `1px solid ${p.inkFaint}`, borderBottom: `1px solid ${p.inkFaint}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 28 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 12, letterSpacing: "0.22em", color: copper, textTransform: "uppercase", fontWeight: 500, flexShrink: 0 } }, "Operando con"), /* @__PURE__ */ React.createElement(ClientLogos, { color: p.inkDim, surface: palette === "light" ? "light" : "dark" }))), /* @__PURE__ */ React.createElement("section", { style: { background: copper, color: "#0a1a26", padding: `80px ${pad}px`, position: "relative", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: -100, top: -100, width: 400, height: 400, border: "1px solid rgba(10,26,38,0.15)", borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: 40, top: 40, width: 200, height: 200, border: "1px solid rgba(10,26,38,0.15)", borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 13, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 600, marginBottom: 18, color: "#0a1a26" } }, "— Hablemos"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 80, letterSpacing: "-0.045em", lineHeight: 0.98, maxWidth: 900 } }, "¿Tu flota está lista para", /* @__PURE__ */ React.createElement("br", null), "la próxima normativa?"), /* @__PURE__ */ React.createElement("p", { style: { margin: "24px 0 0", fontSize: 20, maxWidth: 580, color: "rgba(10,26,38,0.78)", lineHeight: 1.55 } }, "Visitamos tu operación, evaluamos los equipos instalados y te proponemos un plan de continuidad. Sin formularios — hablamos directo.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("a", { style: { background: "#0a1a26", color: "#fff", padding: "20px 34px", fontWeight: 600, fontSize: 17, textDecoration: "none", borderRadius: 2, textAlign: "center" } }, "contacto@andeselec.com"), /* @__PURE__ */ React.createElement("a", { style: { border: "1px solid #0a1a26", color: "#0a1a26", padding: "20px 34px", fontWeight: 600, fontSize: 17, textDecoration: "none", borderRadius: 2, textAlign: "center" } }, "+56 2 2347 8700"), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 13, letterSpacing: "0.14em", color: "rgba(10,26,38,0.68)", marginTop: 6, textAlign: "center" } }, "Carmen Covarrubias 398 · Ñuñoa")))), /* @__PURE__ */ React.createElement("footer", { style: { display: "none", background: p.deep, padding: `60px ${pad}px 32px`, color: p.inkSub } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, paddingBottom: 40, borderBottom: `1px solid ${p.inkFaint}` } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 } }, /* @__PURE__ */ React.createElement(AEMark, { size: 28, surface: palette === "light" ? "light" : "dark" }), /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 16, color: ink } }, "Andes Electrónica")), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 13, lineHeight: 1.55, maxWidth: 320 } }, "Desde 1991 desarrollando productos y servicios electrónicos de alta calidad para transporte, minería, defensa y telecomunicaciones."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 20, ...mono, fontSize: 10.5, letterSpacing: "0.12em", color: `${p.inkDim}` } }, "ISO 9001 · Cert. DT N°139/2009")), [
    ["Productos", ["Sistema SACEL", "Tacógrafo 4.0", "Visor VI7GPS"]],
    ["Servicios", ["Instalaciones", "Servicio técnico", "Diseño & fabricación", "I+D"]],
    ["Empresa", ["Quiénes somos", "ISO 9001", "Contacto", "Privacidad"]]
  ].map(([h, items]) => /* @__PURE__ */ React.createElement("div", { key: h }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, letterSpacing: "0.18em", color: copper, textTransform: "uppercase", marginBottom: 16 } }, h), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 } }, items.map((i) => /* @__PURE__ */ React.createElement("span", { key: i, style: { color: `${p.inkSub}` } }, i)))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 24, ...mono, fontSize: 11, letterSpacing: "0.1em", color: `${p.inkDim}` } }, /* @__PURE__ */ React.createElement("span", null, "© 2026 Andes Electrónica S.A. · Santiago, Chile"), /* @__PURE__ */ React.createElement("span", null, "contacto@andeselec.com · +56 2 2347 8700"))), /* @__PURE__ */ React.createElement(SiteFooter, { theme, pad }));
}
function SacelDashMock({ accent = "#c07d2e", ink = "#e8e4dc", inkDim = "rgba(232,228,220,0.5)", inkFaint = "rgba(232,228,220,0.08)", inkSub = "rgba(232,228,220,0.72)" }) {
  const mono = { fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace' };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 14, ...mono, fontSize: 10, letterSpacing: "0.14em" } }, /* @__PURE__ */ React.createElement("span", { style: { color: inkDim } }, "SACEL · DASHBOARD"), /* @__PURE__ */ React.createElement("span", { style: { color: accent } }, "● LIVE")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 } }, [["Conductores activos", "847"], ["Infracciones hoy", "3"]].map(([k, v], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: 14, background: "rgba(192,125,46,0.06)", border: `1px solid ${accent}`, borderLeftWidth: 3 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 9, color: inkDim, letterSpacing: "0.16em", textTransform: "uppercase" } }, k), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 26, color: ink, fontWeight: 600, marginTop: 4 } }, v)))), /* @__PURE__ */ React.createElement("div", { style: { padding: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(232,228,220,0.08)" } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 9, color: inkDim, letterSpacing: "0.14em", marginBottom: 8 } }, "TELEMETRÍA · ÚLTIMAS 6H"), /* @__PURE__ */ React.createElement("svg", { width: "100%", height: "70", viewBox: "0 0 300 70" }, /* @__PURE__ */ React.createElement("path", { d: "M 0 50 Q 20 30, 40 40 T 80 35 T 120 45 T 160 25 T 200 30 T 240 20 T 300 30", stroke: accent, strokeWidth: "1.5", fill: "none" }), /* @__PURE__ */ React.createElement("path", { d: "M 0 50 Q 20 30, 40 40 T 80 35 T 120 45 T 160 25 T 200 30 T 240 20 T 300 30 L 300 70 L 0 70 Z", fill: accent, fillOpacity: "0.15" }), Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: i * 50, y1: "0", x2: i * 50, y2: "70", stroke: "rgba(232,228,220,0.06)", strokeWidth: "0.5" })))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 10 } }, ["Turbus · 42", "Cruz del Sur · 28", "EFE · 18", "ETM · 12"].map((t) => /* @__PURE__ */ React.createElement("span", { key: t, style: { ...mono, fontSize: 9, padding: "4px 8px", background: inkFaint, color: inkSub, letterSpacing: "0.08em" } }, t))));
}
function FloatingLogo({ theme, palette, pad }) {
  const { p, copper } = theme;
  const ref = React.useRef(null);
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    const products = document.querySelector("[data-products-section]");
    if (!products) return;
    const io = new IntersectionObserver(([entry]) => {
      setHidden(entry.isIntersecting);
    }, { threshold: 0, rootMargin: "0px 0px -55% 0px" });
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
          const offset = window.scrollY * 0.4;
          ref.current.style.transform = `translateY(-${offset}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref,
      "aria-hidden": "true",
      style: {
        position: "fixed",
        right: "max(48px, calc((100vw - 1280px) / 2 + 48px))",
        top: 140,
        width: "min(420px, 32vw)",
        aspectRatio: "1 / 1",
        pointerEvents: "none",
        zIndex: 5,
        opacity: hidden ? 0 : 1,
        transition: `opacity ${theme.durSlow || "260ms"} ${theme.ease || "ease"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        willChange: "transform, opacity"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${p.inkFaint}` } }),
    /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: "10%", borderRadius: "50%", border: `1px solid ${p.inkFaint}` } }),
    /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: "22%", borderRadius: "50%", border: `1px dashed ${p.inkFaint}` } }),
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: window.__resources && window.__resources.aeLogoColour || "assets/logos/AE-logo-colour.svg",
        alt: "",
        style: {
          width: "62%",
          height: "62%",
          objectFit: "contain",
          display: "block",
          position: "relative",
          zIndex: 1,
          filter: palette === "light" ? "none" : "brightness(0) invert(1)"
        }
      }
    ),
    [["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      position: "absolute",
      [v]: 0,
      [h]: 0,
      width: 18,
      height: 18,
      borderTop: v === "top" ? `1px solid ${copper}` : "none",
      borderBottom: v === "bottom" ? `1px solid ${copper}` : "none",
      borderLeft: h === "left" ? `1px solid ${copper}` : "none",
      borderRight: h === "right" ? `1px solid ${copper}` : "none"
    } }))
  );
}
window.V2DeepTeal = V2DeepTeal;
function SignalFlow({ theme, palette }) {
  const { p, copper, mono } = theme;
  const isLight = palette === "light";
  const lanes = [44, 100, 156];
  const flowPaths = [
    { id: "sf-a", d: `M -10 ${lanes[0]} L 280 ${lanes[0]} L 320 ${lanes[1]} L 720 ${lanes[1]} L 760 ${lanes[0]} L 1210 ${lanes[0]}`, dur: 8.4 },
    { id: "sf-b", d: `M -10 ${lanes[1]} L 460 ${lanes[1]} L 500 ${lanes[2]} L 880 ${lanes[2]} L 920 ${lanes[1]} L 1210 ${lanes[1]}`, dur: 11.2 },
    { id: "sf-c", d: `M -10 ${lanes[2]} L 180 ${lanes[2]} L 220 ${lanes[1]} L 600 ${lanes[1]} L 640 ${lanes[2]} L 1210 ${lanes[2]}`, dur: 9.7 }
  ];
  const rules = lanes.map((y, i) => ({ y, dash: i === 1 ? "0" : "4 6" }));
  const nodes = [
    { x: 80, y: lanes[0], r: 4, kind: "filled" },
    { x: 280, y: lanes[0], r: 5, kind: "pulse" },
    { x: 480, y: lanes[0], r: 3, kind: "hollow" },
    { x: 760, y: lanes[0], r: 5, kind: "hollow" },
    { x: 1020, y: lanes[0], r: 4, kind: "filled" },
    { x: 160, y: lanes[1], r: 3, kind: "hollow" },
    { x: 320, y: lanes[1], r: 5, kind: "hollow" },
    { x: 600, y: lanes[1], r: 6, kind: "pulse" },
    { x: 880, y: lanes[1], r: 4, kind: "filled" },
    { x: 1140, y: lanes[1], r: 4, kind: "hollow" },
    { x: 220, y: lanes[2], r: 4, kind: "filled" },
    { x: 500, y: lanes[2], r: 3, kind: "hollow" },
    { x: 780, y: lanes[2], r: 5, kind: "pulse" },
    { x: 1040, y: lanes[2], r: 3, kind: "hollow" }
  ];
  const lineCol = isLight ? "rgba(12,61,92,0.18)" : "rgba(232,228,220,0.22)";
  const lineColFaint = isLight ? "rgba(12,61,92,0.10)" : "rgba(232,228,220,0.12)";
  const surfaceFill = isLight ? "#f5f2ed" : "#05131f";
  const labelCol = isLight ? "rgba(12,61,92,0.42)" : "rgba(232,228,220,0.40)";
  return /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: 8,
    position: "relative",
    width: "100%",
    maxWidth: 1240,
    marginLeft: "auto",
    marginRight: "auto"
  } }, [["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h], i) => /* @__PURE__ */ React.createElement("div", { key: i, "aria-hidden": "true", style: {
    position: "absolute",
    [v]: 16,
    [h]: 0,
    width: 14,
    height: 14,
    borderTop: v === "top" ? `1px solid ${copper}` : "none",
    borderBottom: v === "bottom" ? `1px solid ${copper}` : "none",
    borderLeft: h === "left" ? `1px solid ${copper}` : "none",
    borderRight: h === "right" ? `1px solid ${copper}` : "none",
    zIndex: 2
  } })), /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 1200 200",
      preserveAspectRatio: "none",
      width: "100%",
      height: "220",
      style: { display: "block", overflow: "visible" }
    },
    /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("filter", { id: "sf-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, /* @__PURE__ */ React.createElement("feGaussianBlur", { stdDeviation: "2.4", result: "b" }), /* @__PURE__ */ React.createElement("feMerge", null, /* @__PURE__ */ React.createElement("feMergeNode", { in: "b" }), /* @__PURE__ */ React.createElement("feMergeNode", { in: "SourceGraphic" }))), flowPaths.map((fp) => /* @__PURE__ */ React.createElement("path", { key: fp.id, id: fp.id, d: fp.d, fill: "none" }))),
    rules.map((r, i) => /* @__PURE__ */ React.createElement(
      "line",
      {
        key: i,
        x1: "0",
        y1: r.y,
        x2: "1200",
        y2: r.y,
        stroke: i === 1 ? lineCol : lineColFaint,
        strokeWidth: "1",
        strokeDasharray: r.dash
      }
    )),
    flowPaths.map((fp) => /* @__PURE__ */ React.createElement(
      "path",
      {
        key: `route-${fp.id}`,
        d: fp.d,
        fill: "none",
        stroke: lineColFaint,
        strokeWidth: "1.2"
      }
    )),
    Array.from({ length: 25 }).map((_, i) => {
      const x = 24 + i * 48;
      return /* @__PURE__ */ React.createElement(
        "line",
        {
          key: `tick-${i}`,
          x1: x,
          y1: lanes[1] - 4,
          x2: x,
          y2: lanes[1] + 4,
          stroke: lineColFaint,
          strokeWidth: "1"
        }
      );
    }),
    nodes.map((n, i) => {
      if (n.kind === "filled") {
        return /* @__PURE__ */ React.createElement(
          "circle",
          {
            key: i,
            cx: n.x,
            cy: n.y,
            r: n.r,
            fill: copper,
            stroke: "none"
          }
        );
      }
      if (n.kind === "hollow") {
        return /* @__PURE__ */ React.createElement(
          "circle",
          {
            key: i,
            cx: n.x,
            cy: n.y,
            r: n.r,
            fill: surfaceFill,
            stroke: lineCol,
            strokeWidth: "1.2"
          }
        );
      }
      return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: n.x,
          cy: n.y,
          r: n.r + 14,
          fill: "none",
          stroke: copper,
          strokeWidth: "1",
          opacity: "0"
        },
        /* @__PURE__ */ React.createElement(
          "animate",
          {
            attributeName: "r",
            values: `${n.r};${n.r + 22}`,
            dur: "2.6s",
            begin: `${i * 0.4}s`,
            repeatCount: "indefinite"
          }
        ),
        /* @__PURE__ */ React.createElement(
          "animate",
          {
            attributeName: "opacity",
            values: "0.7;0",
            dur: "2.6s",
            begin: `${i * 0.4}s`,
            repeatCount: "indefinite"
          }
        )
      ), /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: n.x,
          cy: n.y,
          r: n.r + 14,
          fill: "none",
          stroke: copper,
          strokeWidth: "1",
          opacity: "0"
        },
        /* @__PURE__ */ React.createElement(
          "animate",
          {
            attributeName: "r",
            values: `${n.r};${n.r + 22}`,
            dur: "2.6s",
            begin: `${i * 0.4 + 1.3}s`,
            repeatCount: "indefinite"
          }
        ),
        /* @__PURE__ */ React.createElement(
          "animate",
          {
            attributeName: "opacity",
            values: "0.7;0",
            dur: "2.6s",
            begin: `${i * 0.4 + 1.3}s`,
            repeatCount: "indefinite"
          }
        )
      ), /* @__PURE__ */ React.createElement("circle", { cx: n.x, cy: n.y, r: n.r, fill: copper }));
    }),
    flowPaths.map((fp, i) => /* @__PURE__ */ React.createElement("g", { key: `pulse-${fp.id}`, filter: "url(#sf-glow)" }, /* @__PURE__ */ React.createElement("circle", { r: "3.4", fill: copper }, /* @__PURE__ */ React.createElement("animateMotion", { dur: `${fp.dur}s`, repeatCount: "indefinite", begin: `${i * 0.9}s` }, /* @__PURE__ */ React.createElement("mpath", { href: `#${fp.id}` }))), /* @__PURE__ */ React.createElement("circle", { r: "2.2", fill: copper, opacity: "0.5" }, /* @__PURE__ */ React.createElement("animateMotion", { dur: `${fp.dur}s`, repeatCount: "indefinite", begin: `${i * 0.9 + 0.35}s` }, /* @__PURE__ */ React.createElement("mpath", { href: `#${fp.id}` }))), /* @__PURE__ */ React.createElement("circle", { r: "1.6", fill: copper, opacity: "0.25" }, /* @__PURE__ */ React.createElement("animateMotion", { dur: `${fp.dur}s`, repeatCount: "indefinite", begin: `${i * 0.9 + 0.7}s` }, /* @__PURE__ */ React.createElement("mpath", { href: `#${fp.id}` }))))),
    [0, 200].includes && [
      ["M 0 30 L 0 50 L 8 50", "0 30 0 50 8 50"],
      ["M 0 150 L 0 170 L 8 170", "0 150 0 170 8 170"],
      ["M 1200 30 L 1200 50 L 1192 50", null],
      ["M 1200 150 L 1200 170 L 1192 170", null]
    ].map((_, i) => null),
    lanes.map((y, i) => /* @__PURE__ */ React.createElement("g", { key: `cap-${i}` }, /* @__PURE__ */ React.createElement("line", { x1: "0", y1: y - 6, x2: "0", y2: y + 6, stroke: lineCol, strokeWidth: "1.2" }), /* @__PURE__ */ React.createElement("line", { x1: "1200", y1: y - 6, x2: "1200", y2: y + 6, stroke: lineCol, strokeWidth: "1.2" })))
  ));
}
window.SignalFlow = SignalFlow;
function HeroBgLight({ floatRef, pad, copper }) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: floatRef,
      "aria-hidden": "true",
      className: "hero-bg-image",
      style: {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('assets/hero/andes-sphere-bg-light.png')",
        // Identical positioning math as the dark variant — the source image is
        // composed with the sphere at ~22% from left, same as the dark photo.
        backgroundSize: "100vw auto",
        backgroundPosition: `calc(28vw - ${(820 + pad) / 2}px) 50%`,
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.92,
        willChange: "opacity, transform",
        // Mask: fade only the right edge into the page bg (so circuit traces
        // dissolve before they reach the headline column) and the bottom into
        // the surface below. Left edge stays full so the perspective grid lines
        // reach the viewport edge — that anchors the composition visually.
        WebkitMaskImage: "linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.55) 76%, transparent 96%),linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.45) 85%, transparent 100%)",
        WebkitMaskComposite: "source-in",
        maskImage: "linear-gradient(to right, black 0%, black 50%, rgba(0,0,0,0.55) 76%, transparent 96%),linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.45) 85%, transparent 100%)",
        maskComposite: "intersect"
      }
    }
  );
}
window.HeroBgLight = HeroBgLight;
