// Generado desde cookie-consent.jsx por compilar.mjs: no editar a mano.
const CONSENT_KEY = "andes-cookie-consent";
const CONSENT_VERSION = 1;
function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return { decided: false, analytics: false, version: CONSENT_VERSION };
    const obj = JSON.parse(raw);
    if (obj.version !== CONSENT_VERSION) return { decided: false, analytics: false, version: CONSENT_VERSION };
    return { decided: true, analytics: !!obj.analytics, version: obj.version, timestamp: obj.timestamp };
  } catch (e) {
    return { decided: false, analytics: false, version: CONSENT_VERSION };
  }
}
function writeConsent(analytics) {
  const payload = { analytics: !!analytics, decided: true, version: CONSENT_VERSION, timestamp: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  } catch (e) {
  }
  return payload;
}
let __cfgPromise = null;
function loadConfig() {
  if (__cfgPromise) return __cfgPromise;
  __cfgPromise = fetch("data/runtime.config.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).catch(() => null);
  return __cfgPromise;
}
let __gaLoaded = false;
async function loadGA4() {
  if (__gaLoaded) return;
  const cfg = await loadConfig();
  const id = cfg && cfg.ga4MeasurementId;
  if (!id || typeof id !== "string" || id.trim() === "") {
    return;
  }
  __gaLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", /* @__PURE__ */ new Date());
  window.gtag("config", id, {
    anonymize_ip: cfg.anonymizeIp !== false,
    // SPA-friendly defaults; works fine for our multi-page setup too.
    transport_type: "beacon"
  });
}
const AndesCookies = {
  getConsent: readConsent,
  setConsent(analytics) {
    const payload = writeConsent(analytics);
    if (analytics) loadGA4();
    window.dispatchEvent(new CustomEvent("andes:cookie-consent", { detail: payload }));
    __setBannerOpen(false);
  },
  openBanner() {
    __setBannerOpen(true);
  }
};
window.AndesCookies = AndesCookies;
let __bannerSetOpen = null;
function __setBannerOpen(open) {
  if (__bannerSetOpen) __bannerSetOpen(open);
}
function CookieBanner({ initialOpen = true }) {
  const [open, setOpen] = React.useState(initialOpen);
  const [showDetail, setShowDetail] = React.useState(false);
  const [analyticsChecked, setAnalyticsChecked] = React.useState(true);
  React.useEffect(() => {
    __bannerSetOpen = setOpen;
    return () => {
      __bannerSetOpen = null;
    };
  }, []);
  const isLight = (() => {
    try {
      const raw = localStorage.getItem("andes-tweaks");
      if (!raw) return false;
      return JSON.parse(raw).palette === "light";
    } catch (e) {
      return false;
    }
  })();
  const tokens = isLight ? {
    bg: "#ffffff",
    surface: "#f5f2ed",
    ink: "#0c3d5c",
    inkSub: "rgba(12,61,92,0.75)",
    inkDim: "rgba(12,61,92,0.55)",
    inkFaint: "rgba(12,61,92,0.12)"
  } : {
    bg: "#07202f",
    surface: "#08202f",
    ink: "#e8e4dc",
    inkSub: "rgba(232,228,220,0.72)",
    inkDim: "rgba(232,228,220,0.5)",
    inkFaint: "rgba(232,228,220,0.10)"
  };
  const copper = "#c07d2e";
  const onCopper = "#0a1a26";
  const mono = { fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace' };
  const display = { fontFamily: '"DM Serif Display", Georgia, serif', letterSpacing: "-0.015em" };
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "dialog",
      "aria-label": "Aviso de cookies y privacidad",
      style: {
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9e3,
        width: "min(420px, calc(100vw - 40px))",
        background: tokens.bg,
        border: `1px solid ${tokens.inkFaint}`,
        borderTop: `2px solid ${copper}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18)",
        padding: 24,
        color: tokens.ink,
        animation: "andes-cookie-slide-in .35s cubic-bezier(0.16,1,0.3,1)"
      }
    },
    /* @__PURE__ */ React.createElement("style", null, `
        @keyframes andes-cookie-slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `),
    /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, letterSpacing: "0.22em", color: copper, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 } }, "— Cookies y privacidad"),
    /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, ...display, fontSize: 22, lineHeight: 1.2, color: tokens.ink } }, "Esta web usa cookies para mejorar tu experiencia."),
    /* @__PURE__ */ React.createElement("p", { style: { margin: "12px 0 0", fontSize: 13.5, lineHeight: 1.55, color: tokens.inkSub } }, "Las cookies esenciales hacen que el sitio funcione. Las analíticas nos ayudan a entender cómo se usa para mejorarlo — son anónimas y agregadas. Puedes cambiar de opinión en cualquier momento desde la ", /* @__PURE__ */ React.createElement("a", { href: "./Privacidad.html", style: { color: copper, borderBottom: `1px solid ${copper}66`, textDecoration: "none" } }, "página de Privacidad"), "."),
    showDetail && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18, paddingTop: 18, borderTop: `1px solid ${tokens.inkFaint}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, paddingBottom: 14, borderBottom: `1px solid ${tokens.inkFaint}` } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.16em", color: copper, textTransform: "uppercase", fontWeight: 600 } }, "Esenciales"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: tokens.inkSub, marginTop: 4, lineHeight: 1.5 } }, "Necesarias para el funcionamiento del sitio (preferencias de tema, sesión, idioma).")), /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 10.5, letterSpacing: "0.14em", color: tokens.inkDim, textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 2 } }, "Siempre activas")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, paddingTop: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { ...mono, fontSize: 11, letterSpacing: "0.16em", color: copper, textTransform: "uppercase", fontWeight: 600 } }, "Analíticas"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: tokens.inkSub, marginTop: 4, lineHeight: 1.5 } }, "Google Analytics 4 — uso agregado y anonimizado. No se cruza con tu identidad.")), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", cursor: "pointer", paddingTop: 4 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: analyticsChecked,
        onChange: (e) => setAnalyticsChecked(e.target.checked),
        style: { position: "absolute", width: 1, height: 1, margin: -1, padding: 0, border: 0, clip: "rect(0 0 0 0)" },
        "aria-label": "Aceptar cookies analíticas"
      }
    ), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: {
      width: 34,
      height: 18,
      borderRadius: 999,
      background: analyticsChecked ? copper : tokens.inkFaint,
      position: "relative",
      transition: "background .2s"
    } }, /* @__PURE__ */ React.createElement("span", { style: {
      position: "absolute",
      top: 2,
      left: analyticsChecked ? 18 : 2,
      width: 14,
      height: 14,
      borderRadius: "50%",
      background: "#fff",
      transition: "left .2s",
      boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
    } }))))),
    /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => AndesCookies.setConsent(true), style: {
      background: copper,
      color: onCopper,
      border: "none",
      padding: "10px 18px",
      fontSize: 12.5,
      fontWeight: 600,
      letterSpacing: "0.04em",
      cursor: "pointer",
      borderRadius: 2,
      ...mono
    } }, "Aceptar todo"), /* @__PURE__ */ React.createElement("button", { onClick: () => AndesCookies.setConsent(false), style: {
      background: "transparent",
      color: tokens.ink,
      border: `1px solid ${tokens.inkFaint}`,
      padding: "10px 18px",
      fontSize: 12.5,
      fontWeight: 600,
      letterSpacing: "0.04em",
      cursor: "pointer",
      borderRadius: 2,
      ...mono
    } }, "Solo esenciales"), showDetail ? /* @__PURE__ */ React.createElement("button", { onClick: () => AndesCookies.setConsent(analyticsChecked), style: {
      background: "transparent",
      color: copper,
      border: `1px solid ${copper}`,
      padding: "10px 18px",
      fontSize: 12.5,
      fontWeight: 600,
      letterSpacing: "0.04em",
      cursor: "pointer",
      borderRadius: 2,
      ...mono
    } }, "Guardar selección") : /* @__PURE__ */ React.createElement("button", { onClick: () => setShowDetail(true), style: {
      background: "transparent",
      color: tokens.inkSub,
      border: "none",
      padding: "10px 8px",
      fontSize: 12.5,
      fontWeight: 500,
      letterSpacing: "0.04em",
      cursor: "pointer",
      textDecoration: "underline",
      ...mono
    } }, "Personalizar"))
  );
}
function bootstrap() {
  const consent = readConsent();
  if (consent.decided && consent.analytics) loadGA4();
  const container = document.createElement("div");
  container.id = "__andes_cookie_banner_root";
  document.body.appendChild(container);
  ReactDOM.createRoot(container).render(/* @__PURE__ */ React.createElement(CookieBanner, { initialOpen: !consent.decided }));
}
bootstrap();
