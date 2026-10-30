// Generado desde privacidad.jsx por compilar.mjs: no editar a mano.
function Privacidad({ palette = "deep-teal", accent = "copper", typeface = "inter" } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const pad = 72;
  const lastUpdated = "Mayo 2026";
  return /* @__PURE__ */ React.createElement(PageShell, { theme, current: "empresa" }, /* @__PURE__ */ React.createElement(Breadcrumb, { theme, items: [
    { label: "Home", href: "./index.html" },
    { label: "Empresa", href: "./Empresa.html" },
    { label: "Privacidad y cookies" }
  ] }), /* @__PURE__ */ React.createElement(
    PageHero,
    {
      theme,
      eyebrow: "Privacidad y cookies",
      title: "Cómo tratamos tus datos en este sitio.",
      accentWord: "tus datos",
      credentials: `Última actualización · ${lastUpdated} · Pendiente de revisión legal`,
      subtitle: "Esta página explica qué información recopilamos cuando navegas o nos contactas, cómo la usamos, con quién la compartimos y los derechos que la ley chilena te reconoce sobre ella."
    }
  ), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "01", eyebrow: "Resumen rápido", title: "Lo esencial, en cuatro frases.", accentWord: "cuatro frases", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 80px`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 } }, [
    ["Solo lo necesario", "Pedimos los datos mínimos para responder tu consulta o entregar el servicio que contratas."],
    ["No vendemos datos", "No compartimos tu información con terceros con fines comerciales o publicitarios."],
    ["Tú decides", "Puedes consultar, modificar o eliminar tus datos cuando quieras, escribiéndonos al correo de contacto."],
    ["Cookies acotadas", "Solo cookies funcionales y analíticas básicas. No usamos cookies de seguimiento publicitario."]
  ].map(([t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: p.surface, padding: 28, borderTop: `2px solid ${copper}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, color: copper, letterSpacing: "0.18em", marginBottom: 14 } }, "0", i + 1), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.15 } }, t), /* @__PURE__ */ React.createElement("p", { style: { margin: "12px 0 0", fontSize: 14, color: p.inkSub, lineHeight: 1.6 } }, d)))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "02", eyebrow: "Detalle", title: "Tratamiento de datos personales", accentWord: "datos personales", border: true }), /* @__PURE__ */ React.createElement("article", { style: { padding: `20px ${pad}px 60px`, maxWidth: 900 } }, /* @__PURE__ */ React.createElement(LegalBlock, { theme, title: "Qué datos recopilamos" }, /* @__PURE__ */ React.createElement("p", null, "Cuando completas el formulario de contacto pedimos tu nombre, empresa u organización, correo electrónico y teléfono. Adicionalmente registramos el contenido del mensaje y el tema de interés que seleccionas."), /* @__PURE__ */ React.createElement("p", null, "Cuando navegas el sitio, recopilamos datos técnicos básicos: tipo de navegador, sistema operativo, dirección IP, páginas visitadas y duración de la visita. Estos datos sirven para entender el comportamiento agregado y mejorar el sitio — no se cruzan con tu identidad personal.")), /* @__PURE__ */ React.createElement(LegalBlock, { theme, title: "Para qué los usamos" }, /* @__PURE__ */ React.createElement("p", null, "Usamos tus datos de contacto únicamente para responder a tu consulta, hacer seguimiento comercial o entregar el servicio que has solicitado. No los usamos para envíos masivos ni los compartimos con terceros con fines de marketing."), /* @__PURE__ */ React.createElement("p", null, "Los datos técnicos de navegación se procesan en forma agregada y anonimizada para análisis de uso del sitio.")), /* @__PURE__ */ React.createElement(LegalBlock, { theme, title: "Con quién los compartimos" }, /* @__PURE__ */ React.createElement("p", null, "No compartimos tus datos personales con terceros, salvo en los siguientes casos: (a) cuando una autoridad pública con competencia los requiera bajo el marco legal vigente; (b) cuando sea necesario para cumplir con una obligación contractual contigo (por ejemplo, despacho logístico); (c) proveedores tecnológicos que prestan servicios al sitio bajo cláusulas estrictas de confidencialidad (hosting, correo, análisis web).")), /* @__PURE__ */ React.createElement(LegalBlock, { theme, title: "Por cuánto tiempo los guardamos" }, /* @__PURE__ */ React.createElement("p", null, "Los datos de contacto se conservan durante el tiempo necesario para gestionar la consulta o la relación comercial, y posteriormente quedan archivados según las obligaciones legales vigentes (por ejemplo, normativa tributaria). Los datos técnicos de navegación se mantienen por un período máximo de 24 meses.")), /* @__PURE__ */ React.createElement(LegalBlock, { theme, title: "Tus derechos" }, /* @__PURE__ */ React.createElement("p", null, "De acuerdo a la Ley N° 19.628 sobre Protección de la Vida Privada y sus modificaciones, tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales. Para ejercer estos derechos, escríbenos a ", /* @__PURE__ */ React.createElement("a", { href: "mailto:contacto@andeselec.com", style: { color: copper, borderBottom: `1px solid ${copper}66` } }, "contacto@andeselec.com"), " indicando claramente tu solicitud y adjuntando una copia de tu cédula de identidad."))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "03", eyebrow: "Cookies", title: "Cookies que utiliza este sitio", accentWord: "este sitio", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 80px`, maxWidth: 1100 } }, /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 32px", fontSize: 16, color: p.inkSub, lineHeight: 1.65, maxWidth: 760 } }, "Una cookie es un pequeño archivo que un sitio web almacena en tu navegador. Este sitio usa tres categorías de cookies, descritas a continuación. Puedes desactivarlas desde la configuración de tu navegador — el sitio sigue funcionando, aunque algunas funciones podrían comportarse de forma distinta."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: 0, border: `1px solid ${p.inkFaint}` } }, [
    ["Esenciales", "Necesarias para que el sitio funcione (preferencias de tema, estado del menú, sesión).", "Sesión", "No requiere consentimiento"],
    ["Analíticas", "Permiten entender el uso agregado del sitio. No identifican individualmente al visitante.", "Hasta 24 meses", "Consentimiento opcional"],
    ["Marketing", "Este sitio NO utiliza cookies de seguimiento publicitario ni de redes sociales de terceros.", "—", "No aplica"]
  ].map(([cat, desc, dur, consent], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    display: "grid",
    gridTemplateColumns: "160px 1fr 160px 200px",
    gap: 24,
    padding: "22px 24px",
    borderTop: i === 0 ? "none" : `1px solid ${p.inkFaint}`,
    alignItems: "baseline"
  } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.18em", color: copper, textTransform: "uppercase" } }, cat), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: p.ink, lineHeight: 1.6 } }, desc), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.12em", color: p.inkSub, textTransform: "uppercase" } }, dur), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.12em", color: p.inkDim, textTransform: "uppercase" } }, consent))))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "04", eyebrow: "Consultas", title: "¿Necesitas más información?", accentWord: "más información", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 100px` } }, /* @__PURE__ */ React.createElement("div", { style: { background: p.surface, padding: 36, borderLeft: `2px solid ${copper}`, maxWidth: 720 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.22em", color: copper, textTransform: "uppercase", marginBottom: 18, fontWeight: 600 } }, "Contacto para privacidad"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 15.5, color: p.inkSub, lineHeight: 1.65, marginBottom: 18 } }, "Si tienes preguntas sobre cómo tratamos tus datos, o quieres ejercer alguno de los derechos descritos en esta página, escríbenos directamente:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("a", { href: "mailto:contacto@andeselec.com", style: {
    ...display,
    fontSize: 22,
    color: p.ink,
    textDecoration: "none",
    borderBottom: `1px solid ${copper}`,
    paddingBottom: 4,
    alignSelf: "flex-start"
  } }, "contacto@andeselec.com"), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.14em", color: p.inkDim, textTransform: "uppercase" } }, "Andes Electrónica · Carmen Covarrubias 398, Ñuñoa · Santiago, Chile"))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 28, padding: "20px 22px", background: p.surface, borderLeft: `2px solid ${copper}`, maxWidth: 720 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.22em", color: copper, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 } }, "Gestionar mis preferencias"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: p.inkSub, lineHeight: 1.6, marginBottom: 14 } }, "Puedes revisar o cambiar tus preferencias de cookies analíticas en cualquier momento. Tu elección se guarda en este navegador y no se comparte con terceros."), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        if (window.AndesCookies) window.AndesCookies.openBanner();
      },
      style: {
        ...mono,
        fontSize: 12,
        letterSpacing: "0.06em",
        fontWeight: 600,
        background: "transparent",
        color: copper,
        border: `1px solid ${copper}`,
        padding: "10px 18px",
        cursor: "pointer",
        borderRadius: 2
      }
    },
    "Abrir preferencias de cookies →"
  )), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, ...mono, fontSize: 10.5, letterSpacing: "0.18em", color: p.inkDim, textTransform: "uppercase" } }, "Marco legal · Ley N° 19.628 sobre Protección de la Vida Privada · Última actualización: ", lastUpdated)));
}
function LegalBlock({ theme, title, children }) {
  const { p, copper, display, mono } = theme;
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 48 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "40px 1fr", gap: 24, marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.18em", color: copper, paddingTop: 4 } }, "§"), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1.15, color: p.ink } }, title)), /* @__PURE__ */ React.createElement("div", { style: { paddingLeft: 64, fontSize: 15.5, color: p.inkSub, lineHeight: 1.7, maxWidth: 760 } }, children), /* @__PURE__ */ React.createElement("style", null, `
        article p { margin: 0 0 14px; }
        article p:last-child { margin-bottom: 0; }
      `));
}
window.Privacidad = Privacidad;
