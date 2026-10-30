// Generado desde servicios.jsx por compilar.mjs: no editar a mano.
function Servicios({ palette = "deep-teal", accent = "copper", typeface = "inter" } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const services = [
    { label: "01 — INSTALACIÓN", title: "Instalación y puesta en marcha", description: "Equipos en terreno, activación de tacógrafos, integración con flota existente. Cobertura nacional.", meta: "SLA · Nacional", href: "#" },
    { label: "02 — SERVICIO TÉCNICO", title: "Mantención y soporte", description: "Taller propio, técnicos certificados, repuestos con stock. Reparación, calibración y soporte N2/N3.", meta: "Taller Santiago · RMA", href: "#" },
    { label: "03 — INGENIERÍA", title: "Diseño y fabricación electrónica", description: "PCBs, ensamble, testing y certificación para productos unitarios e industriales. Desde prototipo a serie.", meta: "PCB · SMT · Testing", href: "#" },
    { label: "04 — I+D", title: "Investigación y desarrollo", description: "Sistemas de control, reingeniería, electrónica aplicada a problemas específicos de industria.", meta: "Control · Reversing", href: "./Investigacion-Desarrollo.html" }
  ];
  return /* @__PURE__ */ React.createElement(PageShell, { theme, current: "servicios" }, /* @__PURE__ */ React.createElement(Breadcrumb, { theme, items: [{ label: "Home", href: "./index.html" }, { label: "Servicios" }] }), /* @__PURE__ */ React.createElement(
    PageHero,
    {
      theme,
      eyebrow: "Servicios",
      title: "Instalación, operación y soporte continuo de los sistemas que entregamos.",
      accentWord: "soporte continuo",
      credentials: "Cobertura nacional · Equipo técnico interno · Garantía vigente",
      subtitle: "Desde la instalación inicial hasta las actualizaciones firmware a 5 años, el soporte vive aquí. Taller propio en Santiago, técnicos certificados, ingeniería cerca."
    }
  ), /* @__PURE__ */ React.createElement(CardGrid, { theme, columns: 2, paddingBottom: 60 }, services.map((s, i) => /* @__PURE__ */ React.createElement(Card, { key: i, theme, ...s }))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "02", eyebrow: "Compromisos", title: "Lo que significa soporte local", accentWord: "local", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 72px 100px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 } }, [
    ["< 4h", "Respuesta crítica", "Fallos de flota activa, 24/7"],
    ["< 48h", "Visita a terreno", "En Región Metropolitana"],
    ["10 años", "Soporte de producto", "Desde fecha de fabricación"],
    ["99.94%", "Uptime plataforma", "Último año operativo"]
  ].map(([v, t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: p.surface, padding: 24, borderLeft: `2px solid ${copper}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 36, letterSpacing: "-0.03em", color: copper, lineHeight: 1 } }, v), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, color: p.ink, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 12, fontWeight: 600 } }, t), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: p.inkSub, marginTop: 6, lineHeight: 1.5 } }, d)))), /* @__PURE__ */ React.createElement(
    CTABand,
    {
      theme,
      title: "¿Necesitas soporte ahora?",
      accentWord: "ahora",
      primary: { label: "Contactar servicio técnico", href: "./Contacto.html?topic=Servicio%20t%C3%A9cnico" }
    }
  ));
}
window.Servicios = Servicios;
