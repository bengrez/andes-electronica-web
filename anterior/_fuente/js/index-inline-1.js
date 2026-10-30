// Generado desde el <script> de index.html por compilar.mjs: no editar a mano.
const TWEAKS = (
  /*EDITMODE-BEGIN*/
  {
    "palette": "light",
    "typeface": "grotesk",
    "density": "comfortable",
    "accent": "copper"
  }
);
function App() {
  const [tweaks, setTweaks] = React.useState(TWEAKS);
  React.useEffect(() => {
    try {
      localStorage.setItem("andes-tweaks", JSON.stringify(tweaks));
    } catch (e) {
    }
    applyBodyBg({ palette: tweaks.palette });
  }, [tweaks]);
  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") document.getElementById("tweaksPanel").classList.add("show");
      if (d.type === "__deactivate_edit_mode") document.getElementById("tweaksPanel").classList.remove("show");
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    const panel = document.getElementById("tweaksPanel");
    const refresh = () => {
      panel.querySelectorAll(".opts").forEach((g) => {
        const key = g.dataset.group;
        g.querySelectorAll("button").forEach((b) => {
          b.classList.toggle("active", b.dataset.val === tweaks[key]);
        });
      });
    };
    refresh();
    const handler = (ev) => {
      const b = ev.target.closest("button[data-val]");
      if (!b) return;
      const key = b.parentElement.dataset.group;
      const next = { ...tweaks, [key]: b.dataset.val };
      setTweaks(next);
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: next }, "*");
    };
    panel.addEventListener("click", handler);
    return () => {
      window.removeEventListener("message", onMsg);
      panel.removeEventListener("click", handler);
    };
  }, [tweaks]);
  return /* @__PURE__ */ React.createElement(V2DeepTeal, { density: tweaks.density, palette: tweaks.palette, typeface: tweaks.typeface, accent: tweaks.accent });
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
