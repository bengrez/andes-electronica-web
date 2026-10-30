// Generado desde iso9001.jsx por compilar.mjs: no editar a mano.
function ISO9001({ palette = "deep-teal", accent = "copper", typeface = "inter" } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const pad = 72;
  const isLight = palette === "light";
  return /* @__PURE__ */ React.createElement(PageShell, { theme, current: "empresa" }, /* @__PURE__ */ React.createElement(Breadcrumb, { theme, items: [
    { label: "Home", href: "./index.html" },
    { label: "Empresa", href: "./Empresa.html" },
    { label: "ISO 9001" }
  ] }), /* @__PURE__ */ React.createElement(
    PageHero,
    {
      theme,
      eyebrow: "Certificación",
      title: "ISO 9001 — el respaldo formal de cómo trabajamos.",
      accentWord: "cómo trabajamos",
      credentials: "Certificación vigente · Sistema de gestión de calidad · Operación nacional",
      subtitle: "La norma ISO 9001 audita nuestra manera de diseñar, fabricar y soportar electrónica. No es una etiqueta de marketing: es un sistema de gestión que se revisa cada año por un auditor externo y que mantenemos sin interrupción desde el 27 de agosto de 2004."
    }
  ), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "01", eyebrow: "El documento", title: "Certificado oficial", accentWord: "oficial", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 80px`, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, alignItems: "start" } }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "assets/certifications/iso9001-bureau-veritas.png",
      target: "_blank",
      rel: "noopener",
      "aria-label": "Abrir certificado ISO 9001 en una nueva pestaña",
      style: {
        aspectRatio: "1 / 1.34",
        background: "#ffffff",
        border: `1px solid ${p.inkFaint}`,
        borderTop: `3px solid ${copper}`,
        display: "block",
        position: "relative",
        overflow: "hidden",
        textDecoration: "none",
        boxShadow: theme.shadowCard
      }
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "assets/certifications/iso9001-bureau-veritas.png",
        alt: "Certificado ISO 9001 de Andes Electrónica emitido por Bureau Veritas Certification Chile",
        style: { width: "100%", height: "100%", objectFit: "contain", display: "block" }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "iso-cert-hint", style: {
      position: "absolute",
      bottom: 12,
      right: 12,
      ...mono,
      fontSize: 10,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      background: copper,
      color: p.onAccent,
      padding: "6px 10px",
      fontWeight: 600,
      opacity: 0,
      transition: "opacity .2s ease"
    } }, "Ver tamaño completo ↗"),
    /* @__PURE__ */ React.createElement("style", null, `
            a:hover > .iso-cert-hint { opacity: 1; }
          `)
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.22em", color: copper, textTransform: "uppercase", marginBottom: 18, fontWeight: 600 } }, "Datos del certificado"), /* @__PURE__ */ React.createElement(SpecTable, { theme, columns: 1, rows: [
    ["Norma", "ISO 9001:2015 · NCh-ISO 9001:2015"],
    ["Ente certificador", "Bureau Veritas Certification Chile S.A."],
    ["Certificado Serie N°", "BVCSG13456"],
    ["Registro INN", "N° 341"],
    ["Inicio del ciclo original", "27 Agosto 2004"],
    ["Recertificación", "13 Junio 2022"],
    ["Vigencia", "06 Junio 2025"],
    ["Acreditación", "Sistema Nacional de Acreditación · INN-CHILE · SC 006"],
    ["Razón social", "Andes Electrónica Limitada · RUT 78.171.350-3"]
  ] }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 24, padding: "14px 18px", background: `${copper}11`, borderLeft: `2px solid ${copper}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10, letterSpacing: "0.16em", color: copper, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 } }, "Aviso · ciclo en renovación"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: p.inkSub, lineHeight: 1.55 } }, "El documento mostrado corresponde al último escaneo del ciclo Junio 2022 – Junio 2025. El certificado del ciclo vigente está siendo emitido por Bureau Veritas y será publicado aquí al recibirse.")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 24, padding: "20px 22px", background: p.surface, borderLeft: `2px solid ${copper}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10, letterSpacing: "0.18em", color: copper, textTransform: "uppercase", marginBottom: 8 } }, "Documento descargable"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: p.inkSub, lineHeight: 1.55, marginBottom: 14 } }, "Descarga la imagen del certificado para licitaciones, postulaciones y verificaciones internas."), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "assets/certifications/iso9001-bureau-veritas.png",
      download: true,
      style: {
        color: copper,
        fontSize: 14,
        fontWeight: 600,
        textDecoration: "none",
        borderBottom: `1px solid ${copper}`,
        paddingBottom: 4,
        display: "inline-block"
      }
    },
    "Descargar certificado (PNG) ↓"
  )))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "02", eyebrow: "Alcance", title: "Qué cubre la certificación", accentWord: "la certificación", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 40px`, maxWidth: 1100 } }, /* @__PURE__ */ React.createElement("div", { style: {
    background: p.surface,
    padding: "36px 40px",
    borderLeft: `2px solid ${copper}`,
    ...display,
    fontSize: 28,
    lineHeight: 1.3,
    letterSpacing: "-0.015em",
    color: p.ink
  } }, "«Venta, diseño y desarrollo, armado, reparación e instalación de equipos electrónicos tacógrafos, utilizados en el ", /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, "monitoreo de vehículos de transporte"), ".»"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, ...mono, fontSize: 10.5, letterSpacing: "0.16em", color: p.inkDim, textTransform: "uppercase" } }, "Texto literal del alcance · Bureau Veritas Certification Chile")), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 80px`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 } }, [
    ["Venta", "Comercialización de tacógrafos y equipos electrónicos asociados al monitoreo de transporte."],
    ["Diseño y desarrollo", "Ingeniería de hardware y firmware de tacógrafos y periféricos, realizada en Chile."],
    ["Armado y reparación", "Producción y mantención de equipos con trazabilidad por número de serie."],
    ["Instalación", "Implementación en flotas a nivel nacional bajo procedimientos auditados."]
  ].map(([t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: p.surface, padding: 28, borderTop: `2px solid ${copper}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, color: copper, letterSpacing: "0.18em", marginBottom: 14 } }, "0", i + 1), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1.12 } }, t), /* @__PURE__ */ React.createElement("p", { style: { margin: "12px 0 0", fontSize: 13.5, color: p.inkSub, lineHeight: 1.55 } }, d)))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "03", eyebrow: "Qué significa para ti", title: "Beneficio concreto del cliente", accentWord: "del cliente", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 80px`, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 28 } }, [
    ["Procesos documentados", "Cada etapa de un proyecto — desde la cotización hasta la entrega — sigue un procedimiento escrito y auditable. Nada depende de la memoria de una persona."],
    ["Trazabilidad por unidad", "Cada equipo fabricado tiene su número de serie y su historia: lote de componentes, fecha de ensamble, pruebas realizadas, técnico responsable."],
    ["No conformidades tratadas", "Si algo falla, hay un protocolo para registrarlo, investigarlo y corregir la causa raíz. La trazabilidad cierra el ciclo, no se queda en el síntoma."],
    ["Mejora continua auditada", "Un auditor externo revisa el sistema todos los años. Lo que detecta como oportunidad de mejora pasa al plan del siguiente ciclo, sin excepción."]
  ].map(([t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: "20px 24px", borderLeft: `2px solid ${copper}` } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 22, letterSpacing: "-0.02em" } }, t), /* @__PURE__ */ React.createElement("p", { style: { margin: "10px 0 0", fontSize: 14.5, color: p.inkSub, lineHeight: 1.6 } }, d)))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "04", eyebrow: "Historia", title: "Trayectoria de la certificación", accentWord: "de la certificación", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 80px` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, position: "relative" } }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 30,
    height: 1,
    background: `linear-gradient(to right, ${copper}33, ${copper} 20%, ${copper} 80%, ${copper}33)`
  } }), [
    ["2004", "Primera certificación", "El 27 de agosto de 2004 Andes Electrónica obtiene la certificación ISO 9001 por primera vez con Bureau Veritas Certification Chile."],
    ["2015", "Adopción ISO 9001:2015", "Migración a la versión 2015 de la norma — vigente hoy — con foco reforzado en gestión por procesos y análisis de riesgo."],
    ["2022", "Última recertificación", "Auditoría completa de recertificación realizada el 13 de junio de 2022. Certificado serie BVCSG13456, registro INN N° 341."],
    ["Hoy", "En renovación", "Sistema activo bajo auditorías anuales del ente certificador. El ciclo siguiente está en proceso de emisión."]
  ].map(([year, t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: "0 16px", position: "relative" } }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: p.surface,
    border: `2px solid ${copper}`,
    marginBottom: 14,
    position: "relative",
    zIndex: 1
  } }), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.16em", color: copper, marginBottom: 10 } }, year), /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 10 } }, t), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: p.inkSub, lineHeight: 1.55 } }, d))))), /* @__PURE__ */ React.createElement(SectionHead, { theme, num: "05", eyebrow: "Otras acreditaciones", title: "No es la única", accentWord: "la única", border: true }), /* @__PURE__ */ React.createElement("div", { style: { padding: `20px ${pad}px 100px`, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 } }, [
    ["Resolución DT N°139/2009", "Operador certificado por la Dirección del Trabajo para sistemas electrónicos de control de jornada y asistencia."],
    ["Resolución Exenta N°1081 — DT", "Tacógrafo Andes aprobado por la Dirección del Trabajo como equipo de registro de conducción para transporte."],
    ["Inscripción SUBTEL", "[PLACEHOLDER] Equipos con módulos de radio están homologados ante la Subsecretaría de Telecomunicaciones."]
  ].map(([t, d], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: 24, border: `1px solid ${p.inkFaint}`, background: p.surface } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, color: copper, letterSpacing: "0.16em", marginBottom: 12, textTransform: "uppercase" } }, "0", i + 1), /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 20, letterSpacing: "-0.015em", lineHeight: 1.15 } }, t), /* @__PURE__ */ React.createElement("p", { style: { margin: "12px 0 0", fontSize: 14, color: p.inkSub, lineHeight: 1.55 } }, d)))), /* @__PURE__ */ React.createElement(
    CTABand,
    {
      theme,
      title: "¿Necesitas el certificado para una licitación?",
      accentWord: "una licitación",
      primary: { label: "Solicitar copia oficial", href: "./Contacto.html?topic=Otro" },
      secondary: { label: "Conocer a la empresa", href: "./Empresa.html" }
    }
  ));
}
window.ISO9001 = ISO9001;
