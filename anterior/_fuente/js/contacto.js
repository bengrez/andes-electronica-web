// Generado desde contacto.jsx por compilar.mjs: no editar a mano.
function Contacto({ palette = "deep-teal", accent = "copper", typeface = "inter" } = {}) {
  const theme = resolveTheme({ palette, accent, typeface });
  const { p, copper, display, mono, body } = theme;
  const pad = 72;
  const TOPICS = ["SACEL", "Tacógrafo 4.0", "Visor VI7GPS", "Servicio técnico", "I+D / Diseño", "Otro"];
  const initialTopic = React.useMemo(() => {
    if (typeof window === "undefined") return "SACEL";
    try {
      const raw = new URLSearchParams(window.location.search).get("topic");
      if (raw && TOPICS.includes(raw)) return raw;
    } catch (e) {
    }
    return "SACEL";
  }, []);
  const [form, setForm] = React.useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    topic: initialTopic,
    topicOther: "",
    fleet: "",
    message: ""
  });
  const [status, setStatus] = React.useState("idle");
  const submit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1100);
  };
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const input = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${p.inkFaint}`,
    color: p.ink,
    padding: "14px 0",
    fontSize: 15,
    outline: "none",
    ...body,
    transition: "border-color .2s"
  };
  const label = { ...mono, fontSize: 10, letterSpacing: "0.18em", color: p.inkDim, textTransform: "uppercase", marginBottom: 4 };
  return /* @__PURE__ */ React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: p.bg, backgroundAttachment: "fixed", color: p.ink, ...body, position: "relative" } }, /* @__PURE__ */ React.createElement(GridOverlay, { palette }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement(TopNav, { theme, current: "contacto", pad }), /* @__PURE__ */ React.createElement("section", { style: { padding: `64px ${pad}px 48px` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", marginBottom: 28, fontWeight: 500 } }, "— Contacto"), /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, ...display, fontSize: 56, lineHeight: 1.06, letterSpacing: "-0.025em", maxWidth: 1e3, fontWeight: 600 } }, "Para cotizaciones, soporte técnico y proyectos de ingeniería ", /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, "a medida"), "."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, height: 1, width: 96, background: copper } }), /* @__PURE__ */ React.createElement("p", { style: { margin: "28px 0 0", fontSize: 17, lineHeight: 1.6, color: p.inkSub, maxWidth: 640 } }, "Respondemos en menos de 24 horas hábiles con una propuesta concreta. Atención directa de un ingeniero — sin formularios genéricos ni intermediarios comerciales."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, ...mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: p.inkDim, fontWeight: 500 } }, "Santiago de Chile  ·  Lun – Vie 08:30 – 18:00  ·  Soporte 24/7 para clientes con contrato")), /* @__PURE__ */ React.createElement("section", { style: { padding: `40px ${pad}px 100px`, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 72, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(8,32,47,0.4)", border: `1px solid ${p.inkFaint}`, padding: 48, backdropFilter: "blur(6px)" } }, status === "sent" ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "80px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 56, height: 56, borderRadius: "50%", border: `2px solid ${copper}`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 } }, /* @__PURE__ */ React.createElement("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M5 12L10 17L20 7", stroke: copper, strokeWidth: "2.5", strokeLinecap: "square" }))), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 44, letterSpacing: "-0.03em" } }, "Mensaje recibido."), /* @__PURE__ */ React.createElement("p", { style: { margin: "16px auto 0", fontSize: 16, color: p.inkSub, maxWidth: 440, lineHeight: 1.55 } }, "Un ingeniero de Andes Electrónica revisará tu solicitud y responderá a ", /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, form.email || "tu correo"), " en menos de 24 horas hábiles."), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.16em", color: p.inkDim, marginTop: 28, textTransform: "uppercase" } }, "Ref · AE-", (/* @__PURE__ */ new Date()).getTime().toString(36).toUpperCase().slice(-6))) : /* @__PURE__ */ React.createElement("form", { onSubmit: submit }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, paddingBottom: 16, borderBottom: `1px solid ${p.inkFaint}` } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.2em", color: copper, textTransform: "uppercase" } }, "● FORMULARIO DE CONTACTO"), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10, letterSpacing: "0.14em", color: p.inkDim } }, "CIFRADO · TLS 1.3")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: label }, "01 — Nombre"), /* @__PURE__ */ React.createElement("input", { style: input, value: form.name, onChange: update("name"), required: true, placeholder: "Ej. María González" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: label }, "02 — Empresa"), /* @__PURE__ */ React.createElement("input", { style: input, value: form.company, onChange: update("company"), placeholder: "Empresa o flota" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: label }, "03 — Correo"), /* @__PURE__ */ React.createElement("input", { type: "email", style: input, value: form.email, onChange: update("email"), required: true, placeholder: "correo@empresa.cl" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: label }, "04 — Teléfono"), /* @__PURE__ */ React.createElement("input", { style: input, value: form.phone, onChange: update("phone"), placeholder: "+56 9 ..." }))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: label, id: "topic-label" }, "05 — Tema de interés"), /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "radiogroup",
      "aria-labelledby": "topic-label",
      style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }
    },
    TOPICS.map((t) => {
      const id = `topic-${t.replace(/[^a-z0-9]/gi, "")}`;
      const checked = form.topic === t;
      return /* @__PURE__ */ React.createElement("label", { key: t, htmlFor: id, style: {
        ...mono,
        fontSize: 11,
        letterSpacing: "0.08em",
        padding: "9px 14px",
        background: checked ? copper : "transparent",
        border: `1px solid ${checked ? copper : p.inkFaint}`,
        color: checked ? p.onAccent : p.inkSub,
        cursor: "pointer",
        borderRadius: 2,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        transition: "background .15s, border-color .15s, color .15s"
      } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "radio",
          name: "topic",
          id,
          value: t,
          checked,
          onChange: () => setForm({ ...form, topic: t }),
          style: {
            // Visually hidden but focusable — accessible-but-styled radio.
            position: "absolute",
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            border: 0,
            clip: "rect(0 0 0 0)",
            overflow: "hidden"
          }
        }
      ), t);
    })
  ), form.topic === "Otro" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      style: input,
      value: form.topicOther || "",
      onChange: update("topicOther"),
      placeholder: "¿Sobre qué necesitas hablar? Ej. integración con un ERP, repuestos para un equipo antiguo…",
      "aria-label": "Describe brevemente tu consulta"
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 28 } }, /* @__PURE__ */ React.createElement("div", { style: label, id: "fleet-label" }, "06 — Tamaño de flota / operación (opcional)"), /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "radiogroup",
      "aria-labelledby": "fleet-label",
      style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }
    },
    ["< 10", "10–50", "50–200", "200–500", "500+", "N/A"].map((t) => {
      const id = `fleet-${t.replace(/[^a-z0-9]/gi, "")}`;
      const checked = form.fleet === t;
      return /* @__PURE__ */ React.createElement("label", { key: t, htmlFor: id, style: {
        ...mono,
        fontSize: 11,
        letterSpacing: "0.06em",
        padding: "9px 14px",
        background: checked ? "rgba(192,125,46,0.14)" : "transparent",
        border: `1px solid ${checked ? copper : p.inkFaint}`,
        color: checked ? copper : p.inkSub,
        cursor: "pointer",
        borderRadius: 2,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        transition: "background .15s, border-color .15s, color .15s"
      } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "radio",
          name: "fleet",
          id,
          value: t,
          checked,
          onChange: () => setForm({ ...form, fleet: t }),
          style: { position: "absolute", width: 1, height: 1, margin: -1, padding: 0, border: 0, clip: "rect(0 0 0 0)", overflow: "hidden" }
        }
      ), t);
    })
  )), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 32 } }, /* @__PURE__ */ React.createElement("div", { style: label }, "07 — Mensaje"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      style: { ...input, minHeight: 120, resize: "vertical", paddingTop: 14, fontFamily: "inherit" },
      value: form.message,
      onChange: update("message"),
      required: true,
      placeholder: "Describe brevemente tu proyecto, normativa a cumplir, o situación actual..."
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, letterSpacing: "0.14em", color: p.inkDim, maxWidth: 340 } }, "Al enviar aceptas nuestra política de privacidad. No compartimos datos con terceros."), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: status === "sending", style: {
    background: copper,
    color: p.onAccent,
    border: "none",
    padding: "16px 36px",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: status === "sending" ? "wait" : "pointer",
    borderRadius: 2,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    opacity: status === "sending" ? 0.7 : 1,
    ...body
  } }, status === "sending" ? "Enviando…" : /* @__PURE__ */ React.createElement(React.Fragment, null, "Enviar mensaje ", /* @__PURE__ */ React.createElement("span", null, "→")))))), /* @__PURE__ */ React.createElement("aside", { style: { display: "flex", flexDirection: "column", gap: 32 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", marginBottom: 16 } }, "— Contacto directo"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 36, letterSpacing: "-0.03em", lineHeight: 1.05 } }, "¿Prefieres ir al grano?")), [
    { label: "Correo", value: "contacto@andeselec.com", sub: "Ventas, cotizaciones, soporte", href: "mailto:contacto@andeselec.com", icon: "✉", iconLabel: "Correo electrónico" },
    { label: "Teléfono", value: "+56 2 2347 8700", sub: "Lun a Vie · 8:30 – 18:00", href: "tel:+56223478700", icon: "☏", iconLabel: "Teléfono" }
  ].map((c, i) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: i,
      href: c.href,
      "aria-label": `${c.label}: ${c.value}`,
      style: {
        display: "block",
        textDecoration: "none",
        color: p.ink,
        borderLeft: `2px solid ${copper}`,
        paddingLeft: 20,
        paddingTop: 4,
        paddingBottom: 4,
        transition: "padding-left .2s"
      },
      onMouseEnter: (e) => e.currentTarget.style.paddingLeft = "26px",
      onMouseLeave: (e) => e.currentTarget.style.paddingLeft = "20px"
    },
    /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10, letterSpacing: "0.2em", color: p.inkDim, textTransform: "uppercase", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { "aria-label": c.iconLabel, role: "img" }, c.icon), "   ", c.label),
    /* @__PURE__ */ React.createElement("div", { style: { ...display, fontSize: 22, letterSpacing: "-0.02em", fontWeight: 500 } }, c.value),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: p.inkSub, marginTop: 4 } }, c.sub)
  )))), /* @__PURE__ */ React.createElement("section", { style: { background: p.surface, padding: `90px ${pad}px`, borderTop: `1px solid ${p.inkFaint}`, borderBottom: `1px solid ${p.inkFaint}`, position: "relative", zIndex: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 64, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", marginBottom: 16 } }, "— Oficina central"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 56, letterSpacing: "-0.035em", lineHeight: 1 } }, "Santiago, Chile.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, "Ñuñoa.")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 36, display: "grid", gridTemplateColumns: "1fr", gap: 22 } }, [
    ["Dirección", "Carmen Covarrubias 398\nÑuñoa, Región Metropolitana\nChile"],
    ["Horario", "Lunes a Viernes\n8:30 – 18:00 hrs"],
    ["Estacionamiento", "Disponible para clientes\ncon cita previa"]
  ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { borderTop: `1px solid ${p.inkFaint}`, paddingTop: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10, letterSpacing: "0.18em", color: p.inkDim, textTransform: "uppercase", marginBottom: 8 } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: p.ink, lineHeight: 1.6, whiteSpace: "pre-line" } }, v)))), /* @__PURE__ */ React.createElement("a", { href: "https://maps.google.com/?q=Carmen+Covarrubias+398+Nunoa", target: "_blank", style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginTop: 36,
    color: copper,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    borderBottom: `1px solid ${copper}`,
    paddingBottom: 4
  } }, "Abrir en Google Maps ", /* @__PURE__ */ React.createElement("span", null, "→"))), /* @__PURE__ */ React.createElement("div", { style: { border: `1px solid ${p.inkFaint}`, background: p.surface2, aspectRatio: "4/3", position: "relative", overflow: "hidden" } }, /* @__PURE__ */ React.createElement(
    "iframe",
    {
      title: "Andes Electrónica — Carmen Covarrubias 398, Ñuñoa",
      src: "https://www.google.com/maps?q=Carmen+Covarrubias+398,+%C3%91u%C3%B1oa,+Santiago,+Chile&z=16&hl=es&output=embed",
      width: "100%",
      height: "100%",
      frameBorder: "0",
      style: {
        border: 0,
        width: "100%",
        height: "100%",
        filter: palette === "light" ? "none" : "invert(92%) hue-rotate(180deg) saturate(0.55) brightness(0.95) contrast(0.95)"
      },
      loading: "lazy",
      referrerPolicy: "no-referrer-when-downgrade"
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 12, left: 12, ...mono, fontSize: 10, letterSpacing: "0.16em", color: copper, background: p.deep + "cc", padding: "6px 10px", border: `1px solid ${copper}`, textTransform: "uppercase", pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: copper, marginRight: 8, verticalAlign: "middle" } }), "Carmen Covarrubias 398 · Ñuñoa"), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "https://www.google.com/maps/dir/?api=1&destination=Carmen+Covarrubias+398,+%C3%91u%C3%B1oa,+Santiago,+Chile",
      target: "_blank",
      rel: "noopener",
      style: { position: "absolute", bottom: 12, right: 12, ...mono, fontSize: 10, letterSpacing: "0.16em", color: p.onAccent, background: copper, padding: "8px 14px", textDecoration: "none", textTransform: "uppercase", fontWeight: 600 }
    },
    "Cómo llegar →"
  )))), /* @__PURE__ */ React.createElement("section", { style: { padding: `100px ${pad}px`, position: "relative", zIndex: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 64, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", marginBottom: 16 } }, "— Preguntas frecuentes"), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 48, letterSpacing: "-0.035em", lineHeight: 1.02 } }, "Antes de escribirnos, quizás esto ayude.")), /* @__PURE__ */ React.createElement(FAQ, { theme }))), /* @__PURE__ */ React.createElement(SiteFooter, { theme, pad })));
}
function StylizedMap({ copper, p, mono }) {
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 600 450", width: "100%", height: "100%", preserveAspectRatio: "xMidYMid slice" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("pattern", { id: "mapgrid", width: "40", height: "40", patternUnits: "userSpaceOnUse" }, /* @__PURE__ */ React.createElement("path", { d: "M 40 0 L 0 0 0 40", fill: "none", stroke: p.inkFaint, strokeWidth: "0.8" }))), /* @__PURE__ */ React.createElement("rect", { width: "600", height: "450", fill: p.surface2 }), /* @__PURE__ */ React.createElement("rect", { width: "600", height: "450", fill: "url(#mapgrid)" }), /* @__PURE__ */ React.createElement("g", { stroke: p.inkDim, strokeWidth: "1.2", fill: "none", opacity: "0.6" }, /* @__PURE__ */ React.createElement("path", { d: "M 0 180 Q 150 170, 300 220 T 600 260" }), /* @__PURE__ */ React.createElement("path", { d: "M 0 320 Q 180 300, 350 340 T 600 380" }), /* @__PURE__ */ React.createElement("path", { d: "M 80 0 Q 120 150, 250 230 T 380 450" }), /* @__PURE__ */ React.createElement("path", { d: "M 450 0 Q 430 140, 380 230 T 320 450" })), /* @__PURE__ */ React.createElement("g", { stroke: p.inkFaint, strokeWidth: "0.6", fill: "none" }, Array.from({ length: 10 }).map((_, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: "0", y1: 45 * i, x2: "600", y2: 45 * i + 20 })), Array.from({ length: 12 }).map((_, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: 50 * i, y1: "0", x2: 50 * i - 30, y2: "450" }))), /* @__PURE__ */ React.createElement("ellipse", { cx: "180", cy: "140", rx: "46", ry: "30", fill: copper, fillOpacity: "0.06", stroke: copper, strokeOpacity: "0.3", strokeWidth: "0.8" }), /* @__PURE__ */ React.createElement("rect", { x: "440", y: "90", width: "70", height: "50", fill: copper, fillOpacity: "0.05", stroke: copper, strokeOpacity: "0.2", strokeWidth: "0.8" }), /* @__PURE__ */ React.createElement("g", { transform: "translate(310 235)" }, /* @__PURE__ */ React.createElement("circle", { r: "48", fill: copper, fillOpacity: "0.08", stroke: copper, strokeOpacity: "0.35", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { r: "22", fill: copper, fillOpacity: "0.2", stroke: copper, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("circle", { r: "6", fill: copper }), /* @__PURE__ */ React.createElement("circle", { r: "8", fill: "none", stroke: copper, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("line", { x1: "-80", y1: "0", x2: "-34", y2: "0", stroke: copper, strokeOpacity: "0.4", strokeWidth: "0.8", strokeDasharray: "2 3" })), /* @__PURE__ */ React.createElement("g", { transform: "translate(180 230)" }, /* @__PURE__ */ React.createElement("rect", { x: "0", y: "0", width: "120", height: "36", fill: p.surface, stroke: copper, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("text", { x: "10", y: "16", fontSize: "9", fill: copper, fontFamily: '"JetBrains Mono",monospace', letterSpacing: "0.12em" }, "● ANDES ELEC."), /* @__PURE__ */ React.createElement("text", { x: "10", y: "28", fontSize: "7.5", fill: p.inkDim, fontFamily: '"JetBrains Mono",monospace', letterSpacing: "0.08em" }, "CARMEN COVARRUBIAS 398")), /* @__PURE__ */ React.createElement("g", { transform: "translate(540 50)" }, /* @__PURE__ */ React.createElement("circle", { r: "20", fill: "none", stroke: p.inkDim, strokeWidth: "0.8" }), /* @__PURE__ */ React.createElement("path", { d: "M 0 -14 L 4 0 L 0 14 L -4 0 Z", fill: copper, stroke: copper, strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement("text", { y: "-24", textAnchor: "middle", fontSize: "8", fill: p.inkDim, fontFamily: '"JetBrains Mono",monospace', letterSpacing: "0.1em" }, "N")), /* @__PURE__ */ React.createElement("g", { transform: "translate(30 410)" }, /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "0", x2: "60", y2: "0", stroke: p.inkDim, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "-4", x2: "0", y2: "4", stroke: p.inkDim, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("line", { x1: "60", y1: "-4", x2: "60", y2: "4", stroke: p.inkDim, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("text", { x: "0", y: "18", fontSize: "8", fill: p.inkDim, fontFamily: '"JetBrains Mono",monospace' }, "0"), /* @__PURE__ */ React.createElement("text", { x: "50", y: "18", fontSize: "8", fill: p.inkDim, fontFamily: '"JetBrains Mono",monospace' }, "500m")));
}
function FAQ({ theme }) {
  const { p, copper, display, mono, body } = theme;
  const [open, setOpen] = React.useState(0);
  const items = [
    {
      q: "¿Cuánto tarda una instalación de SACEL en una flota nueva?",
      a: "Para flotas de hasta 50 vehículos, completamos instalación y capacitación en 2–3 semanas. Flotas mayores se planifican por etapas. Incluye puesta en marcha, entrenamiento a operadores y 30 días de soporte dedicado."
    },
    {
      q: "¿Son operador certificado por la Dirección del Trabajo?",
      a: "Sí. Andes Electrónica es operador certificado bajo la Resolución DT N°139/2009 para sistemas electrónicos de control de asistencia y jornada. También contamos con certificación ISO 9001 vigente."
    },
    {
      q: "¿Hacen desarrollo a medida o solo venden productos de línea?",
      a: "Ambos. Desde 1991 desarrollamos electrónica aplicada para terceros: diseño de PCBs, firmware, ensamble y certificación. Atendemos tanto unitarios prototípicos como series industriales."
    },
    {
      q: "¿Qué pasa si falla un tacógrafo instalado?",
      a: "Si tienes contrato de soporte, nuestro servicio técnico responde en 24 horas hábiles (2 horas para emergencias críticas). Tenemos unidades de reemplazo inmediato para clientes con contrato activo."
    },
    {
      q: "¿Atienden fuera de Santiago?",
      a: "Sí. Tenemos técnicos certificados viajando regularmente a regiones. Para instalaciones grandes coordinamos presencia en terreno durante todo el roll-out."
    }
  ];
  return /* @__PURE__ */ React.createElement("div", null, items.map((it, i) => {
    const isOpen = open === i;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { borderTop: `1px solid ${p.inkFaint}`, ...i === items.length - 1 ? { borderBottom: `1px solid ${p.inkFaint}` } : {} } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpen(isOpen ? -1 : i), style: {
      width: "100%",
      background: "transparent",
      border: "none",
      padding: "24px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 20,
      cursor: "pointer",
      color: p.ink,
      textAlign: "left"
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 24, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { ...mono, fontSize: 11, letterSpacing: "0.18em", color: copper, flexShrink: 0 } }, String(i + 1).padStart(2, "0")), /* @__PURE__ */ React.createElement("span", { style: { ...display, fontSize: 20, letterSpacing: "-0.02em", fontWeight: 500 } }, it.q)), /* @__PURE__ */ React.createElement("span", { style: { ...mono, fontSize: 20, color: copper, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .25s", flexShrink: 0 } }, "+")), /* @__PURE__ */ React.createElement("div", { style: {
      maxHeight: isOpen ? 400 : 0,
      overflow: "hidden",
      transition: "max-height .35s ease, padding .25s",
      paddingLeft: 50,
      paddingBottom: isOpen ? 28 : 0,
      paddingRight: 40
    } }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 15.5, color: p.inkSub, lineHeight: 1.65, maxWidth: 720, ...body } }, it.a)));
  }));
}
window.Contacto = Contacto;
