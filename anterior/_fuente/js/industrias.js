// Generado desde industrias.jsx por compilar.mjs: no editar a mano.
function Industrias({ palette = "deep-teal", accent = "copper", typeface = "inter" } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, displayEditorial, mono, body } = theme;
  const pad = 72;
  const industries = [
    {
      num: "01",
      key: "transporte",
      title: "Transporte",
      Pattern: PatternTransporte,
      tagline: "La flota que mueve al país.",
      body: "Operadores interurbanos y urbanos, transporte de carga y pasajeros. Tacógrafos certificados, plataforma SACEL y telemetría en tiempo real.",
      stats: [["[Equipos]", "Tacógrafos en operación"], ["[Flotas]", "Operadores activos"], ["[Año]", "Desde"]]
    },
    {
      num: "02",
      key: "mineria",
      title: "Minería",
      Pattern: PatternMineria,
      tagline: "Electrónica para condiciones extremas.",
      body: "Equipos especializados para ambientes abrasivos. Certificaciones de seguridad, tolerancia térmica extendida y desarrollos a medida bajo NDA.",
      stats: [["[IP]", "Grado de protección"], ["[Rango]", "Temperatura operativa"], ["[Años]", "Experiencia sectorial"]]
    },
    {
      num: "03",
      key: "defensa",
      title: "Defensa",
      Pattern: PatternDefensa,
      tagline: "Ingeniería para aplicaciones críticas.",
      body: "Hardware dedicado, reingeniería de sistemas legacy y mantención de electrónica especializada. Diseño y fabricación en Chile, cadena de custodia controlada.",
      stats: [["[Años]", "En el sector"], ["ISO 9001", "Calidad certificada"], ["CL", "Diseño y fabricación nacional"]]
    },
    {
      num: "04",
      key: "telco",
      title: "Telecomunicaciones",
      Pattern: PatternTelco,
      tagline: "Conectividad donde la red no llega.",
      body: "Módulos de comunicación industrial, gateways y soluciones de monitoreo remoto. Integración con redes celulares, satelitales y RF privadas.",
      stats: [["[Equipos]", "Gateways instalados"], ["4G/Sat", "Conectividad"], ["MQTT", "Protocolo abierto"]]
    }
  ];
  return /* @__PURE__ */ React.createElement(PageShell, { theme, current: "industrias" }, /* @__PURE__ */ React.createElement(Breadcrumb, { theme, items: [{ label: "Home", href: "./index.html" }, { label: "Industrias" }] }), /* @__PURE__ */ React.createElement(
    PageHero,
    {
      theme,
      eyebrow: "Industrias",
      title: "Ingeniería electrónica para operaciones donde la continuidad no es negociable.",
      accentWord: "no es negociable",
      credentials: "Transporte · Minería · Defensa · Telecomunicaciones",
      subtitle: "Cuatro verticales en los que hemos construido expertise por más de tres décadas. Cada industria con su lenguaje técnico, cadencia operacional y requisitos normativos — los aprendemos de adentro."
    }
  ), /* @__PURE__ */ React.createElement("section", { style: { padding: `40px ${pad}px 80px`, borderTop: `1px solid ${p.inkFaint}`, position: "relative" } }, /* @__PURE__ */ React.createElement(
    ChileMap,
    {
      accent: copper,
      ink: p.ink,
      inkSub: p.inkSub,
      inkDim: p.inkDim,
      inkFaint: p.inkFaint,
      surface: p.surface
    }
  )), /* @__PURE__ */ React.createElement("section", { style: { padding: `48px ${pad}px 24px`, borderTop: `1px solid ${p.inkFaint}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.24em", color: p.inkDim, textTransform: "uppercase", fontWeight: 500, marginBottom: 20 } }, "— Verticales atendidos"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...displayEditorial || display, fontSize: 42, lineHeight: 1.1, letterSpacing: "-0.025em", maxWidth: 760, fontWeight: 600 } }, "Cuatro industrias, un mismo estándar de ingeniería."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 24, height: 1, width: 80, background: copper } })), /* @__PURE__ */ React.createElement("section", { style: { padding: `40px ${pad}px 100px`, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: p.inkFaint } }, industries.map((ind) => /* @__PURE__ */ React.createElement(IndustryCard, { key: ind.key, theme, ...ind }))), /* @__PURE__ */ React.createElement(
    CTABand,
    {
      theme,
      title: "¿Tu industria requiere otra cosa?",
      accentWord: "otra cosa",
      primary: { label: "Hablemos", href: "./Contacto.html" },
      secondary: { label: "Ver I+D", href: "./Investigacion-Desarrollo.html" }
    }
  ));
}
function IndustryCard({ theme, num, title, Pattern, tagline, body, stats, onClick }) {
  const { p, copper, display, displayEditorial, mono, ease, durBase } = theme;
  const [hover, setHover] = React.useState(false);
  return /* @__PURE__ */ React.createElement(
    "article",
    {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        background: p.bg,
        padding: 0,
        position: "relative",
        cursor: "default",
        transition: `background ${durBase} ${ease}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 480
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      height: 240,
      borderBottom: `1px solid ${p.inkFaint}`,
      background: hover ? "rgba(192,125,46,0.04)" : "transparent",
      transition: `background ${durBase} ${ease}`,
      position: "relative",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement(Pattern, { accent: copper, ink: p.ink, active: hover }), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: 16,
      left: 20,
      ...mono,
      fontSize: 10.5,
      letterSpacing: "0.22em",
      color: copper,
      fontWeight: 500
    } }, num)),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "32px 32px 32px", display: "flex", flexDirection: "column", flex: 1 } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...displayEditorial || display, fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.025em", color: p.ink, fontWeight: 600 } }, title), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, fontSize: 15, color: p.inkSub, fontStyle: "italic", lineHeight: 1.4 } }, tagline), /* @__PURE__ */ React.createElement("p", { style: { margin: "20px 0 0", fontSize: 14.5, lineHeight: 1.6, color: p.inkSub, maxWidth: 520 } }, body), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 28, paddingTop: 24, borderTop: `1px solid ${p.inkFaint}`, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 } }, stats.map(([v, k], i) => /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("div", { style: { ...displayEditorial || display, fontSize: 20, lineHeight: 1, color: p.ink, letterSpacing: "-0.015em", fontWeight: 600 } }, v), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 9.5, letterSpacing: "0.16em", color: p.inkDim, marginTop: 8, fontWeight: 500, textTransform: "uppercase", lineHeight: 1.3 } }, k))))),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: hover ? 3 : 0,
      background: copper,
      transition: `width ${durBase} ${ease}`
    } })
  );
}
window.Industrias = Industrias;
