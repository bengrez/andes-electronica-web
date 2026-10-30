// Generado desde otros-productos.jsx por compilar.mjs: no editar a mano.
function OtrosProductos({ palette = "deep-teal", accent = "copper", typeface = "inter" } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono } = theme;
  const pad = 72;
  const items = [
    { name: "Producto pendiente 01", kind: "Categoría", desc: "Descripción técnica pendiente. Reemplazar con datos reales del catálogo." },
    { name: "Producto pendiente 02", kind: "Categoría", desc: "Descripción técnica pendiente. Reemplazar con datos reales del catálogo." },
    { name: "Producto pendiente 03", kind: "Categoría", desc: "Descripción técnica pendiente. Reemplazar con datos reales del catálogo." },
    { name: "Producto pendiente 04", kind: "Categoría", desc: "Descripción técnica pendiente. Reemplazar con datos reales del catálogo." }
  ];
  return /* @__PURE__ */ React.createElement(PageShell, { theme, current: "productos" }, /* @__PURE__ */ React.createElement(Breadcrumb, { theme, items: [
    { label: "Home", href: "./index.html" },
    { label: "Productos", href: "./Productos.html" },
    { label: "Otros productos" }
  ] }), /* @__PURE__ */ React.createElement(
    PageHero,
    {
      theme,
      eyebrow: "Catálogo extendido",
      title: "Equipos complementarios y soluciones a medida para flotas y proyectos industriales.",
      accentWord: "a medida",
      credentials: "ISO 9001:2015 · Diseño y fabricación nacional",
      subtitle: "Más allá de la línea estrella, mantenemos un catálogo de equipos auxiliares, repuestos certificados y desarrollos específicos para clientes con requerimientos particulares."
    }
  ), /* @__PURE__ */ React.createElement(CardGrid, { theme, columns: 2, paddingBottom: 60 }, items.map((it, i) => /* @__PURE__ */ React.createElement(
    Card,
    {
      key: i,
      theme,
      label: it.kind,
      title: it.name,
      description: it.desc,
      meta: "Especificaciones a confirmar",
      href: "./Contacto.html?topic=Otro"
    }
  ))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "02", eyebrow: "Catálogo en construcción", title: "¿Buscas un equipo específico?", accentWord: "específico" }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 100px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 } }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 17, color: p.inkSub, lineHeight: 1.65 } }, "Esta página será actualizada con el listado completo de equipos complementarios — repuestos certificados, accesorios para tacógrafos, módulos de comunicación, sensores y desarrollos por demanda."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("a", { href: "./Contacto.html?topic=Otro", style: { color: copper, textDecoration: "none", borderBottom: `1px solid ${copper}`, paddingBottom: 6, fontSize: 16, fontWeight: 600, alignSelf: "flex-start" } }, "Consultar disponibilidad →"), /* @__PURE__ */ React.createElement("a", { href: "./Investigacion-Desarrollo.html", style: { color: p.inkSub, textDecoration: "none", borderBottom: `1px solid ${p.inkFaint}`, paddingBottom: 6, fontSize: 16, alignSelf: "flex-start" } }, "Solicitar un desarrollo a medida"))), /* @__PURE__ */ React.createElement(
    CTABand,
    {
      theme,
      title: "¿Necesitas un equipo que no aparece en catálogo?",
      accentWord: "no aparece",
      primary: { label: "Conversemos", href: "./Contacto.html?topic=Otro" },
      secondary: { label: "Ver capacidades de I+D", href: "./Investigacion-Desarrollo.html" }
    }
  ));
}
window.OtrosProductos = OtrosProductos;
