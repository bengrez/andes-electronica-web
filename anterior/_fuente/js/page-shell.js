// Generado desde page-shell.jsx por compilar.mjs: no editar a mano.
function PageHero({ theme, eyebrow, title, subtitle, accentWord, pad = 72, credentials, aside }) {
  const { p, copper, display, mono, body } = theme;
  let titleNode = title;
  if (accentWord && typeof title === "string") {
    const parts = title.split(accentWord);
    titleNode = parts.flatMap((part, i) => i === 0 ? [part] : [/* @__PURE__ */ React.createElement("span", { key: i, style: { color: copper } }, accentWord), part]);
  }
  const editorial = /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.24em", color: copper, textTransform: "uppercase", fontWeight: 500, marginBottom: 28 } }, "— ", eyebrow), /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, ...display, fontSize: aside ? 48 : 56, lineHeight: 1.06, letterSpacing: "-0.025em", maxWidth: 1e3, fontWeight: 600 } }, titleNode), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, height: 1, width: 96, background: copper } }), subtitle && /* @__PURE__ */ React.createElement("p", { style: { marginTop: 28, fontSize: 17, lineHeight: 1.6, color: p.inkSub, maxWidth: 680, fontWeight: 400 } }, subtitle), credentials && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 32, ...mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: p.inkDim, fontWeight: 500 } }, credentials));
  return /* @__PURE__ */ React.createElement("section", { style: { padding: `64px ${pad}px 56px`, position: "relative" } }, aside ? /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.9fr)", gap: 56, alignItems: "center" } }, editorial, /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "center" } }, aside)) : editorial);
}
function SectionHead({ theme, num, eyebrow, title, accentWord, pad = 72, border = true }) {
  const { p, copper, display, mono } = theme;
  let titleNode = title;
  if (accentWord && typeof title === "string") {
    const parts = title.split(accentWord);
    titleNode = parts.flatMap((part, i) => i === 0 ? [part] : [/* @__PURE__ */ React.createElement("span", { key: i, style: { color: copper, fontStyle: "italic" } }, accentWord), part]);
  }
  return /* @__PURE__ */ React.createElement("div", { style: { padding: `0 ${pad}px`, paddingTop: 90, paddingBottom: 40, display: "grid", gridTemplateColumns: "80px 1fr", gap: 32, borderTop: border ? `1px solid ${p.inkFaint}` : "none", marginTop: border ? 0 : 0 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, color: copper, letterSpacing: "0.14em" } }, num), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, color: copper, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500, marginBottom: 14 } }, eyebrow), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 58, lineHeight: 0.98, letterSpacing: "-0.035em", maxWidth: 900 } }, titleNode)));
}
function CardGrid({ theme, columns = 3, gap = 28, children, pad = 72, paddingTop = 20, paddingBottom = 100 }) {
  return /* @__PURE__ */ React.createElement("div", { style: { padding: `${paddingTop}px ${pad}px ${paddingBottom}px`, display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap } }, children);
}
function Card({ theme, label, title, description, meta, href, image, featured, children, icon }) {
  const { p, copper, accentSoft, display, mono, body, ease, durBase, durSlow, shadowCard, shadowHover, rMd } = theme;
  const [hover, setHover] = React.useState(false);
  const borderColor = featured ? copper : p.inkFaint;
  const bg = featured ? `${copper}10` : p.surface;
  return /* @__PURE__ */ React.createElement(
    "a",
    {
      href: href || "#",
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: bg,
        border: `1px solid ${hover ? copper : borderColor}`,
        padding: 30,
        minHeight: 360,
        textDecoration: "none",
        color: p.ink,
        borderRadius: rMd,
        boxShadow: hover ? shadowHover : shadowCard,
        transition: `background ${durBase} ${ease}, border-color ${durBase} ${ease}, transform ${durSlow} ${ease}, box-shadow ${durSlow} ${ease}`,
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        overflow: "hidden"
      }
    },
    /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: hover ? 3 : 2,
      background: copper,
      opacity: featured ? 1 : hover ? 1 : 0.35,
      transition: `opacity ${durBase} ${ease}, height ${durBase} ${ease}`
    } }),
    image && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20, height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", border: `1px solid ${p.inkFaint}`, borderRadius: theme.rSm } }, image),
    icon && /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: theme.rMd, background: hover ? `${copper}2e` : accentSoft, color: copper, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 18, transition: `background ${durBase} ${ease}` } }, icon),
    label && /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, color: copper, letterSpacing: "0.18em", marginBottom: 14, textTransform: "uppercase", fontWeight: 500 } }, label),
    /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, ...display, fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.025em" } }, title),
    description && /* @__PURE__ */ React.createElement("p", { style: { margin: "14px 0 20px", fontSize: 14, color: p.inkSub, lineHeight: 1.55 } }, description),
    children,
    /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${p.inkFaint}` } }, meta && /* @__PURE__ */ React.createElement("span", { style: { ...mono, fontSize: 10.5, color: p.inkDim, letterSpacing: "0.14em" } }, meta), /* @__PURE__ */ React.createElement("span", { style: { ...mono, fontSize: 11, color: copper, letterSpacing: "0.14em", fontWeight: 600, marginLeft: "auto" } }, "VER →"))
  );
}
function SpecTable({ theme, rows, columns = 2 }) {
  const { p, copper, mono } = theme;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `0 48px` } }, rows.map(([k, v], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "grid", gridTemplateColumns: "140px 1fr", gap: 14, padding: "14px 0", borderBottom: `1px solid ${p.inkFaint}`, alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, color: p.inkDim, letterSpacing: "0.14em", textTransform: "uppercase" } }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: p.ink, lineHeight: 1.45 } }, v))));
}
function Breadcrumb({ theme, items, pad = 72 }) {
  const { p, copper, mono } = theme;
  return /* @__PURE__ */ React.createElement("div", { style: { padding: `28px ${pad}px 0`, ...mono, fontSize: 11, letterSpacing: "0.14em", color: p.inkDim, textTransform: "uppercase" } }, items.map((it, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, i > 0 && /* @__PURE__ */ React.createElement("span", { style: { margin: "0 10px", color: p.inkFaint } }, "/"), it.href ? /* @__PURE__ */ React.createElement("a", { href: it.href, style: { color: p.inkSub, textDecoration: "none" } }, it.label) : /* @__PURE__ */ React.createElement("span", { style: { color: copper } }, it.label))));
}
function CTABand({ theme, title, accentWord, primary, secondary, eyebrow, pad = 72 }) {
  const { p, copper, display, mono, ease, durBase, shadowCTA, shadowCTAHover, rPill } = theme;
  let titleNode = title;
  if (accentWord && typeof title === "string") {
    const parts = title.split(accentWord);
    titleNode = parts.flatMap((part, i) => i === 0 ? [part] : [/* @__PURE__ */ React.createElement("span", { key: i, style: { fontStyle: "italic" } }, accentWord), part]);
  }
  return /* @__PURE__ */ React.createElement("section", { style: { background: copper, color: p.onAccent, padding: `90px ${pad}px`, position: "relative", zIndex: 2, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: { position: "absolute", right: -120, top: -120, width: 420, height: 420, border: `1px solid rgba(10,26,38,0.14)`, borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: { position: "absolute", right: 60, top: 60, width: 220, height: 220, border: `1px solid rgba(10,26,38,0.10)`, borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 820 } }, eyebrow && /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 600, marginBottom: 18, color: p.onAccent, opacity: 0.85 } }, "— ", eyebrow), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 64, letterSpacing: "-0.035em", lineHeight: 1.02 } }, titleNode)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, flexWrap: "wrap" } }, primary && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: primary.href,
      className: "andes-cta-primary",
      style: {
        background: p.onAccent,
        color: "#f5efdf",
        padding: "16px 32px",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.02em",
        textDecoration: "none",
        borderRadius: rPill,
        boxShadow: shadowCTA,
        transition: `transform ${durBase} ${ease}, box-shadow ${durBase} ${ease}`
      }
    },
    primary.label,
    " →"
  ), secondary && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: secondary.href,
      className: "andes-cta-secondary",
      style: {
        border: `1.5px solid ${p.onAccent}`,
        color: p.onAccent,
        padding: "16px 32px",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.02em",
        textDecoration: "none",
        borderRadius: rPill,
        transition: `background ${durBase} ${ease}, transform ${durBase} ${ease}`
      }
    },
    secondary.label
  ))), /* @__PURE__ */ React.createElement("style", null, `
        .andes-cta-primary:hover { transform: translateY(-2px); box-shadow: ${shadowCTAHover}; }
        .andes-cta-secondary:hover { background: rgba(10,26,38,0.08); transform: translateY(-2px); }
      `));
}
function PageShell({ theme, current, children, pad = 72 }) {
  const { p, body } = theme;
  return /* @__PURE__ */ React.createElement("div", { style: { width: "100%", minHeight: "100vh", background: p.bg, backgroundAttachment: "fixed", color: p.ink, ...body, position: "relative" } }, /* @__PURE__ */ React.createElement(GridOverlay, { palette: theme.palette }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", zIndex: 2 } }, /* @__PURE__ */ React.createElement(TopNav, { theme, current, pad }), children, /* @__PURE__ */ React.createElement(SiteFooter, { theme, pad })));
}
Object.assign(window, { PageHero, SectionHead, CardGrid, Card, SpecTable, Breadcrumb, CTABand, PageShell });
