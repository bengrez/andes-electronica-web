// ─── Andes Electrónica · BETA badge
//
// Self-mounting fixed badge shown on every page until the site is approved for
// public release. The whole point is to keep stakeholders aware that the
// numbers, copy and certificate dates shown across the site are still under
// validation — so the site is not screenshot'd out of context as "official."
//
// Boundaries:
//   - window.AndesBeta — small public API: hide() / show() / set(message).
//   - localStorage key `andes-beta-dismissed` — if set, the badge stays
//     COLLAPSED on subsequent loads (small dot only). Not a permanent dismiss;
//     re-opens with one click.
//   - Position: bottom-LEFT so it doesn't collide with the cookie banner
//     (bottom-right) or the Tweaks panel (top-right).
//
// Mounting: this file self-bootstraps. The host HTML just needs to load it via
// <script type="text/babel" src="./beta-badge.jsx"></script> after React is
// available. DOM ready when this script runs (we load after the page render).

const BETA_KEY = 'andes-beta-collapsed';
const BETA_DEFAULTS = {
  message: 'Sitio en validación — números y datos sujetos a confirmación.',
  link: { label: 'Equipo Andes', href: 'mailto:contacto@andeselec.com' },
};

function BetaBadge() {
  // Read collapsed state from storage; default = expanded so first-time viewer
  // sees the full message. Subsequent loads honor whatever the user chose.
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return localStorage.getItem(BETA_KEY) === '1'; } catch { return false; }
  });
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    try { localStorage.setItem(BETA_KEY, collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  // Read the active palette from the persisted tweaks so colors match.
  // Fallback to dark surface if anything goes sideways.
  const isLight = (() => {
    try {
      const raw = localStorage.getItem('andes-tweaks');
      if (!raw) return false;
      return JSON.parse(raw).palette === 'light';
    } catch { return false; }
  })();

  const copper = '#c07d2e';
  const onCopper = '#0a1a26';
  const ink = isLight ? '#0c3d5c' : '#e8e4dc';
  const bg = isLight ? '#ffffff' : '#07202f';
  const border = isLight ? 'rgba(12,61,92,0.12)' : 'rgba(232,228,220,0.10)';
  const mono = { fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace' };

  // Expose tiny imperative API for any other code that wants to manipulate it.
  React.useEffect(() => {
    window.AndesBeta = {
      hide:  () => setHidden(true),
      show:  () => setHidden(false),
      open:  () => setCollapsed(false),
      close: () => setCollapsed(true),
    };
  }, []);

  if (hidden) return null;

  // Collapsed = just a small pill that says BETA. Expanded = pill + message.
  return (
    <div
      role="status"
      aria-label="Aviso: sitio en versión beta"
      style={{
        position: 'fixed', bottom: 20, left: 20, zIndex: 8800,
        // Keep the badge clear of the iOS safe-area on mobile
        bottom: 'max(20px, env(safe-area-inset-bottom))',
        left:   'max(20px, env(safe-area-inset-left))',
        display: 'flex', alignItems: 'stretch',
        background: bg,
        border: `1px solid ${border}`,
        borderTop: `2px solid ${copper}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.14)',
        maxWidth: collapsed ? 88 : 'min(360px, calc(100vw - 40px))',
        transition: 'max-width .35s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        color: ink,
      }}>
      {/* The "BETA" stamp itself — always clickable to toggle collapse. */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Mostrar aviso de versión beta' : 'Ocultar aviso de versión beta'}
        style={{
          ...mono, fontSize: 11, letterSpacing: '0.22em', fontWeight: 700,
          background: copper, color: onCopper,
          border: 'none', cursor: 'pointer',
          padding: '10px 14px',
          flexShrink: 0,
        }}>
        BETA
      </button>

      {/* The detail panel — appears when expanded. */}
      <div style={{
        padding: '8px 14px 8px 12px',
        display: collapsed ? 'none' : 'flex',
        flexDirection: 'column', justifyContent: 'center',
        minWidth: 0,
      }}>
        <div style={{
          ...mono, fontSize: 10, letterSpacing: '0.16em', color: copper,
          textTransform: 'uppercase', fontWeight: 600, marginBottom: 2,
        }}>
          Aviso interno
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.4, color: ink }}>
          {BETA_DEFAULTS.message}
        </div>
      </div>
    </div>
  );
}

(function bootstrapBetaBadge() {
  const container = document.createElement('div');
  container.id = '__andes_beta_badge_root';
  document.body.appendChild(container);
  ReactDOM.createRoot(container).render(<BetaBadge/>);
})();
