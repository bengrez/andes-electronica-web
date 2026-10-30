// Generado desde investigacion.jsx por compilar.mjs: no editar a mano.
function StackDiagram({ theme }) {
  const { p, copper, mono, display } = theme;
  const layers = [
    ["01", "Hardware", "El equipo físico"],
    ["02", "Software", "La lógica del sistema"],
    ["03", "Plataforma", "Todo en un solo lugar"],
    ["04", "Datos y reportes", "Decisiones más fáciles"]
  ];
  const CARD = 156;
  const STEP_X = 50;
  const STEP_Y = 74;
  const rigW = CARD + STEP_X * (layers.length - 1);
  const rigH = CARD + STEP_Y * (layers.length - 1);
  const isLight = p.ink && p.ink.startsWith("#0c");
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", padding: "4px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, letterSpacing: "0.22em", color: copper, textTransform: "uppercase", marginBottom: 24, fontWeight: 600 } }, "De punta a punta"), /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    width: "100%",
    maxWidth: rigW,
    height: rigH,
    marginLeft: "auto",
    marginRight: "auto"
  } }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", style: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    overflow: "visible"
  }, viewBox: `0 0 ${rigW} ${rigH}`, preserveAspectRatio: "none" }, layers.slice(0, -1).map((_, i) => {
    const x1 = i * STEP_X + CARD - 16;
    const y1 = i * STEP_Y + 18;
    const x2 = (i + 1) * STEP_X + CARD - 16;
    const y2 = (i + 1) * STEP_Y + 18;
    return /* @__PURE__ */ React.createElement("line", { key: i, x1, y1, x2, y2, stroke: copper, strokeOpacity: "0.45", strokeWidth: "1.2", strokeDasharray: "3 4" });
  })), layers.map(([num, name, tag], i) => /* @__PURE__ */ React.createElement("div", { key: num, style: {
    position: "absolute",
    top: i * STEP_Y,
    left: i * STEP_X,
    width: CARD,
    height: CARD,
    background: p.surface,
    border: `1px solid ${p.inkFaint}`,
    borderTop: `2px solid ${copper}`,
    // Layered shadow gives each square a "lifted" feel against the one
    // behind it; deeper cards (lower i) sit further from the viewer so
    // their own cast is shorter, top card carries the full shadow.
    boxShadow: isLight ? `0 ${4 + i * 4}px ${10 + i * 4}px -4px rgba(12,61,92,${0.1 + i * 0.06})` : `0 ${4 + i * 4}px ${10 + i * 4}px -4px rgba(0,0,0,${0.4 + i * 0.08})`,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: i + 1
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 9.5, letterSpacing: "0.22em", color: copper, fontWeight: 600 } }, num), /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 17, letterSpacing: "-0.01em", color: p.ink, lineHeight: 1.1, marginTop: 10 } }, name)), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10, color: p.inkDim, letterSpacing: "0.06em" } }, tag), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: `stack-node n${i}`, style: {
    position: "absolute",
    right: 11,
    top: 13,
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: p.surface,
    border: `1.5px solid ${copper}`
  } })))), /* @__PURE__ */ React.createElement("style", null, `
        @keyframes stackNodeBlink {
          0%, 78%, 100% {
            background: ${p.surface};
            box-shadow: 0 0 0 0 ${copper}00;
          }
          14%, 50% {
            background: ${copper};
            box-shadow: 0 0 14px ${copper}cc, 0 0 0 5px ${copper}33;
          }
        }
        /* Cascade bottom→top of the stack (01 → 02 → 03 → 04) so the visual
           reads "data flows up from the hardware all the way to the report." */
        .stack-node.n0 { animation: stackNodeBlink 3.2s 0.00s infinite; }
        .stack-node.n1 { animation: stackNodeBlink 3.2s 0.55s infinite; }
        .stack-node.n2 { animation: stackNodeBlink 3.2s 1.10s infinite; }
        .stack-node.n3 { animation: stackNodeBlink 3.2s 1.65s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .stack-node { animation: none !important; background: ${copper}88 !important; }
        }
      `));
}
function InvestigacionDesarrollo({ palette = "deep-teal", accent = "copper", typeface = "inter" } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const pad = 72;
  return /* @__PURE__ */ React.createElement(PageShell, { theme, current: "investigacion" }, /* @__PURE__ */ React.createElement(Breadcrumb, { theme, items: [{ label: "Home", href: "./index.html" }, { label: "I+D" }] }), /* @__PURE__ */ React.createElement(
    PageHero,
    {
      theme,
      eyebrow: "Investigación y desarrollo",
      title: "Soluciones de ingeniería a medida para problemas sin respuesta estándar.",
      accentWord: "sin respuesta estándar",
      credentials: "Equipo propio · Hardware + firmware integrados · Pruebas de campo en Chile",
      subtitle: "Treinta y cuatro años diseñando y fabricando electrónica nos han dejado herramientas propias — circuitos, firmware, diagnóstico y testing afinados en terreno. Eso es lo que nos permite tomar proyectos que no caben en un catálogo.",
      aside: /* @__PURE__ */ React.createElement(StackDiagram, { theme })
    }
  ), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "01", eyebrow: "Áreas de trabajo", title: "Dónde concentramos el esfuerzo", accentWord: "esfuerzo", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 60px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 } }, [
    ["Sistemas de control embebidos", "Firmware de tiempo real, integración de sensores, control PID, comunicación industrial (CAN, RS-485, Modbus)."],
    ["Reingeniería de electrónica legacy", "Recuperar funcionalidad de equipos sin soporte del fabricante original. Ingeniería inversa, redibujo de esquemáticos, fabricación de repuestos."],
    ["Telemetría y conectividad", "Diseño de gateways que conectan equipos viejos a plataformas modernas — MQTT, HTTPS, APIs internas."],
    ["Prototipado rápido", "De la idea al PCB funcional en semanas. Testing, iteración, validación de concepto antes del commit industrial."]
  ].map(([t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: p.surface, padding: 32, borderTop: `2px solid ${copper}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, color: copper, letterSpacing: "0.18em", marginBottom: 16 } }, "0", i + 1), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 28, letterSpacing: "-0.02em" } }, t), /* @__PURE__ */ React.createElement("p", { style: { margin: "14px 0 0", fontSize: 14, color: p.inkSub, lineHeight: 1.6 } }, d)))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "02", eyebrow: "Proceso", title: "Cómo abordamos un proyecto nuevo", accentWord: "nuevo", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 60px`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 } }, [
    ["Brief técnico", "Entendemos requisito, entorno operacional, normativa, volumen. Una semana.", "1–2 sem"],
    ["Factibilidad", "Entregamos propuesta con arquitectura, cronograma y costo. Firma de alcance.", "2–3 sem"],
    ["Prototipo", "Diseño, fabricación y validación funcional en mesa. Iteración cerrada.", "6–12 sem"],
    ["Producción piloto", "Primera serie instalada en operación real. Telemetría y ajustes.", "4–8 sem"]
  ].map(([t, d, dur], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "relative", padding: 24, background: p.surface2, borderTop: `1px solid ${p.inkFaint}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 28, color: copper, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 16, fontWeight: 700 } }, "0", i + 1), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 20, letterSpacing: "-0.015em" } }, t), /* @__PURE__ */ React.createElement("p", { style: { margin: "10px 0 14px", fontSize: 13, color: p.inkSub, lineHeight: 1.5 } }, d), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, color: copper, letterSpacing: "0.14em" } }, "► ", dur)))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "03", eyebrow: "Proyectos", title: "Ejemplos recientes", accentWord: "recientes", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 100px`, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 } }, [
    { y: "2024", t: "Gateway de telemetría minero", d: "Adquisición CAN/Modbus → plataforma cloud. Entorno +45°C, vibración severa.", m: "Minería privada" },
    { y: "2023", t: "Tacógrafo 4.0 — rediseño", d: "Nueva generación con 4G nativo, GNSS multiconstelación y SmartCard.", m: "Producto interno" },
    { y: "2022", t: "Control electrónico legacy", d: "Reemplazo de tarjeta de control obsoleta en equipo industrial importado.", m: "Operador industrial" }
  ].map((x, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: 24, border: `1px solid ${p.inkFaint}`, background: p.surface } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, color: copper, letterSpacing: "0.18em", marginBottom: 16 } }, x.y, " · ", x.m), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.1 } }, x.t), /* @__PURE__ */ React.createElement("p", { style: { margin: "12px 0 0", fontSize: 14, color: p.inkSub, lineHeight: 1.55 } }, x.d)))), /* @__PURE__ */ React.createElement(
    CTABand,
    {
      theme,
      title: "¿Tenemos algo que construir juntos?",
      accentWord: "juntos",
      primary: { label: "Contactar I+D", href: "./Contacto.html?topic=I%2BD%20%2F%20Dise%C3%B1o" }
    }
  ));
}
window.InvestigacionDesarrollo = InvestigacionDesarrollo;
