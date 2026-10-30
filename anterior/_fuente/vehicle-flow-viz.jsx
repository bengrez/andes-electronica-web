// VehicleFlowViz — scroll-driven "del vehículo al reporte"
// Adapted from a 5-phase storyboard (mapa → pulsos → abstracción → clusters → reporte → salida).
// Andes palette: copper as the only chromatic accent, ink-faint for secondary network.
// Progress 0..1 is driven by the scroll position of the host section relative to the viewport.

function VehicleFlowViz({ theme, hostRef, label = 'Telemetría · Datos · Reportabilidad' }) {
  const { p, copper, mono, ink } = theme;
  const isLight = theme.palette === 'light';
  const [progress, setProgress] = React.useState(0);

  // Tokens derived from theme
  const stroke      = isLight ? 'rgba(12,61,92,0.78)'  : 'rgba(232,228,220,0.86)';
  const strokeFaint = isLight ? 'rgba(12,61,92,0.18)'  : 'rgba(232,228,220,0.18)';
  const strokeMute  = isLight ? 'rgba(12,61,92,0.48)'  : 'rgba(232,228,220,0.5)';
  const gridLine    = isLight ? 'rgba(12,61,92,0.06)'  : 'rgba(232,228,220,0.05)';
  const coreFill    = isLight ? 'rgba(12,61,92,0.92)'  : 'rgba(245,247,250,0.85)';
  const cardBg      = isLight ? 'rgba(250,249,247,0.94)' : 'rgba(7,19,31,0.74)';
  const cardStroke  = isLight ? 'rgba(12,61,92,0.18)'  : 'rgba(232,228,220,0.18)';
  const panelBg     = isLight ? 'rgba(12,61,92,0.04)'  : 'rgba(232,228,220,0.05)';
  const panelStroke = isLight ? 'rgba(12,61,92,0.10)'  : 'rgba(232,228,220,0.09)';
  const reportLine  = isLight ? 'rgba(12,61,92,0.22)'  : 'rgba(245,247,250,0.22)';
  const accentSoft  = isLight ? 'rgba(192,125,46,0.6)' : 'rgba(212,137,58,0.62)';

  React.useEffect(() => {
    if (!hostRef?.current) return;
    let raf = 0;
    let target = 0;
    let current = 0;
    const lerpFactor = 0.06; // Lower = more inertia = slower transitions

    const measure = () => {
      const el = hostRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const travel = Math.max(1, rect.height - vh);
      target = Math.max(0, Math.min(1, -rect.top / travel));
    };

    const tick = () => {
      current += (target - current) * lerpFactor;
      if (Math.abs(target - current) > 0.0005) {
        setProgress(current);
        raf = requestAnimationFrame(tick);
      } else {
        // Snap to final to avoid never-quite-reaching the bound
        if (current !== target) {
          current = target;
          setProgress(current);
        }
        raf = 0;
      }
    };

    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Initialize current = target immediately so first paint is correct
    measure();
    current = target;
    setProgress(current);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hostRef]);

  // Phase helpers
  const clamp = (n, mn = 0, mx = 1) => Math.min(mx, Math.max(mn, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const fade = (p, a, b, c, d) => smooth(seg(p, a, b)) * (1 - smooth(seg(p, c, d)));

  const labels = [
    { at: 0.00, name: 'Mapa vivo',    title: 'Vehículos en mapa',    text: 'Cada punto representa una unidad en movimiento sobre la red territorial.' },
    { at: 0.20, name: 'Pulsos',       title: 'Telemetría activa',    text: 'Los puntos palpitan: el pulso indica la captura de señal y el envío de datos.' },
    { at: 0.42, name: 'Abstracción',  title: 'Colapso y transición', text: 'El pulso retorna al centro; el dato abandona la geografía hacia el plano analítico.' },
    { at: 0.58, name: 'Clusters',     title: 'Patrones analíticos',  text: 'Los puntos se reorganizan en clústeres para identificar densidades de operación.' },
    { at: 0.78, name: 'Reporte',      title: 'Reportabilidad',       text: 'Los puntos se convierten en métricas del reporte — legibles, estructuradas y exportables.' },
  ];
  const activeLabel = labels.reduce((acc, l) => (progress >= l.at ? l : acc), labels[0]);

  const vehicles = [
    { id: 1, map: [214,458], drift: [22,-15], cluster: [280,238], report: [612,222], phase: .02, delay: .00, hot: false },
    { id: 2, map: [314,356], drift: [-18,20], cluster: [312,222], report: [630,214], phase: .19, delay: .02, hot: false },
    { id: 3, map: [416,244], drift: [18,14],  cluster: [338,268], report: [650,236], phase: .33, delay: .04, hot: false },
    { id: 4, map: [554,292], drift: [-22,12], cluster: [294,286], report: [618,270], phase: .52, delay: .06, hot: false },
    { id: 5, map: [720,254], drift: [-20,-14],cluster: [560,252], report: [674,250], phase: .68, delay: .08, hot: true  },
    { id: 6, map: [484,384], drift: [22,-8],  cluster: [352,420], report: [606,288], phase: .81, delay: .10, hot: false },
    { id: 7, map: [672,426], drift: [-16,18], cluster: [594,290], report: [684,268], phase: .94, delay: .12, hot: true  },
    { id: 8, map: [252,236], drift: [16,12],  cluster: [390,396], report: [642,292], phase: .43, delay: .05, hot: false },
    { id: 9, map: [602,186], drift: [-18,15], cluster: [526,274], report: [662,226], phase: .73, delay: .09, hot: false },
    { id:10, map: [370,502], drift: [16,-16], cluster: [426,432], report: [686,296], phase: .27, delay: .11, hot: false },
  ];

  // Scene-level computed values
  const p2 = progress;
  const mapOpacity     = 1 - smooth(seg(p2, 0.48, 0.62));
  const clusterOpacity = smooth(seg(p2, 0.46, 0.58)) * (1 - smooth(seg(p2, 0.84, 0.94)));
  // Report fades IN at 0.70..0.84, then EXITS to the right at 0.88..0.97 so the
  // document clears the sticky frame before the section releases and the page
  // continues downward. Exit reserves the final ~10% of the scroll window for
  // the animation — section ends at 1.0, exit completes by 0.97.
  const exitT          = smooth(seg(p2, 0.88, 0.97));
  const reportOpacity  = smooth(seg(p2, 0.70, 0.84)) * (1 - exitT);
  const travelOpacity  = fade(p2, 0.38, 0.48, 0.58, 0.68);

  const mapY = lerp(0, -15, smooth(seg(p2, 0.45, 0.62)));
  const mapS = lerp(1, 0.98, smooth(seg(p2, 0.45, 0.62)));
  const clusterX = lerp(15, 0, smooth(seg(p2, 0.42, 0.58)));
  const clusterY = lerp(15, 0, smooth(seg(p2, 0.42, 0.58)));
  const clusterS = lerp(0.97, 1, smooth(seg(p2, 0.42, 0.58)));
  const reportX = lerp(0, 600, exitT);
  const reportY = lerp(0, -8, exitT);
  const reportS = lerp(0.98, 0.94, exitT);

  const routeDash = 160 - p2 * 200;

  const phaseChips = ['Mapa', 'Pulsos', 'Abstracción', 'Clusters', 'Reporte'];
  const phaseIdx = labels.findIndex(l => l.name === activeLabel.name);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1.16 / 1',
      background: panelBg,
      border: `1px solid ${cardStroke}`,
      overflow: 'hidden',
    }}>
      {/* Phase pill — top-left */}
      <div style={{
        position: 'absolute', top: 18, left: 18, zIndex: 4,
        ...mono, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: copper, fontWeight: 600,
      }}>
        Fase {String(phaseIdx + 1).padStart(2,'0')} · {activeLabel.name}
      </div>

      {/* Legend chip — top-right */}
      <div style={{
        position: 'absolute', top: 18, right: 18, zIndex: 4,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px',
        background: cardBg, border: `1px solid ${cardStroke}`,
        ...mono, fontSize: 10, color: strokeMute, letterSpacing: '0.06em',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: copper, boxShadow: `0 0 10px ${copper}` }}/>
        cada punto = un vehículo
      </div>

      <svg viewBox="0 0 900 650" preserveAspectRatio="xMidYMid meet" style={{
        width: '100%', height: '100%', display: 'block', overflow: 'visible',
      }}>
        <defs>
          <linearGradient id="vfvCopperGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={copper} stopOpacity="0.4"/>
            <stop offset="1" stopColor={copper} stopOpacity="0.95"/>
          </linearGradient>
          <clipPath id="vfvReportClip">
            <rect x="555" y="120" width="280" height="370" rx="4"/>
          </clipPath>
        </defs>

        {/* Background ambient lines */}
        <g style={{ opacity: 1 - exitT }}>
          <path d="M70 98 C210 20 312 146 448 78 S684 66 816 122" fill="none" stroke={strokeFaint} strokeWidth="1.2"/>
          <path d="M52 538 C190 470 330 596 488 520 S690 478 846 556" fill="none" stroke={strokeFaint} strokeWidth="1.2"/>
          <circle cx="715" cy="122" r="76" fill="none" stroke={accentSoft} strokeOpacity="0.2"/>
          <circle cx="715" cy="122" r="116" fill="none" stroke={accentSoft} strokeOpacity="0.12"/>
        </g>

        {/* MAP layer — territorial network */}
        <g style={{
          opacity: mapOpacity,
          transform: `translate(0px, ${mapY}px) scale(${mapS})`,
          transformOrigin: 'center',
        }}>
          <path d="M160 164 C238 204 252 312 332 340 C426 374 470 282 554 310 C648 342 674 420 760 406" fill="none" stroke={strokeFaint} strokeWidth="1.3"/>
          <path d="M114 382 C198 362 218 256 310 246 C390 236 430 178 516 188 C594 198 620 266 734 240" fill="none" stroke={strokeFaint} strokeWidth="1.3"/>
          <path d="M196 512 C256 456 338 472 392 422 C454 366 496 406 564 362 C622 324 694 322 804 280" fill="none" stroke={strokeFaint} strokeWidth="1.3"/>
          <path d="M320 118 C342 188 320 246 366 302 C420 368 402 456 450 528" fill="none" stroke={strokeFaint} strokeWidth="1.3"/>
          <path d="M584 112 C532 184 558 248 520 314 C476 390 516 450 496 548" fill="none" stroke={strokeFaint} strokeWidth="1.3"/>
          <path d="M704 144 C660 222 712 294 666 358 C626 414 656 478 620 552" fill="none" stroke={strokeFaint} strokeWidth="1.3"/>
          {/* Active copper routes */}
          <path d="M180 484 C292 388 296 254 420 232 C548 210 596 314 744 248"
            fill="none" stroke={copper} strokeOpacity="0.42" strokeWidth="2"
            strokeDasharray="10 18" strokeLinecap="round"
            style={{ strokeDashoffset: routeDash }}/>
          <path d="M138 310 C260 282 354 334 460 356 C570 378 640 430 778 392"
            fill="none" stroke={copper} strokeOpacity="0.32" strokeWidth="2"
            strokeDasharray="10 18" strokeLinecap="round"
            style={{ strokeDashoffset: routeDash * 0.85 }}/>
        </g>

        {/* TRAVEL lines — transition phase */}
        <g style={{ opacity: travelOpacity }}>
          {[
            'M214 458 C244 390 258 310 300 250',
            'M314 356 C304 300 304 260 326 220',
            'M416 244 C462 240 514 254 558 292',
            'M554 292 C532 318 516 354 424 430',
            'M720 254 C660 238 598 226 562 252',
            'M484 384 C430 388 390 402 352 420',
            'M672 426 C620 402 594 350 586 334',
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="url(#vfvCopperGrad)" strokeWidth="1.2"
              strokeDasharray="2 10" strokeLinecap="round"
              style={{ strokeDashoffset: 90 - p2 * 160 - i * 6, opacity: 0.4 + (i % 3) * 0.18 }}/>
          ))}
        </g>

        {/* CLUSTER layer — analytical plane */}
        <g style={{
          opacity: clusterOpacity,
          transform: `translate(${clusterX}px, ${clusterY}px) scale(${clusterS})`,
          transformOrigin: 'center',
        }}>
          {/* grid */}
          {[170, 250, 330, 410, 490].map(y => (
            <line key={`h${y}`} x1="145" x2="760" y1={y} y2={y} stroke={gridLine} strokeWidth="1"/>
          ))}
          {[190, 290, 390, 490, 590, 690].map(x => (
            <line key={`v${x}`} x1={x} x2={x} y1="140" y2="520" stroke={gridLine} strokeWidth="1"/>
          ))}
          {/* cluster halos */}
          <ellipse cx="306" cy="260" rx="66" ry="48" fill="none" stroke={strokeFaint} strokeWidth="1.4" strokeDasharray="4 9"/>
          <ellipse cx="560" cy="296" rx="74" ry="54" fill="none" stroke={copper} strokeOpacity="0.46" strokeWidth="1.4" strokeDasharray="4 9"/>
          <ellipse cx="392" cy="440" rx="72" ry="50" fill="none" stroke={strokeFaint} strokeWidth="1.4" strokeDasharray="4 9"/>
        </g>

        {/* REPORT card — final phase */}
        <g style={{
          opacity: reportOpacity,
          transform: `translate(${reportX}px, ${reportY}px) scale(${reportS})`,
          transformOrigin: 'center',
          filter: `blur(${lerp(0, 5, exitT)}px)`,
        }}>
          <rect x="555" y="120" width="280" height="370" rx="4" fill={cardBg} stroke={cardStroke} strokeWidth="1.4"/>
          {/* card chrome */}
          <line x1="555" y1="158" x2="835" y2="158" stroke={panelStroke} strokeWidth="1"/>
          <text x="572" y="148" fill={copper} fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="1.4">SACEL · REPORTE</text>
          <circle cx="816" cy="142" r="3" fill={copper}/>
          {/* panels */}
          <rect x="580" y="178" width="128" height="142" rx="2" fill={panelBg} stroke={panelStroke}/>
          <rect x="724" y="178" width="84"  height="142" rx="2" fill={panelBg} stroke={panelStroke}/>
          <rect x="580" y="344" width="228" height="110" rx="2" fill={panelBg} stroke={panelStroke}/>
          {/* donut */}
          <circle cx="644" cy="245" r="32" fill="none" stroke={panelStroke} strokeWidth="14"/>
          <path d="M644 213 A32 32 0 0 1 676 245" fill="none" stroke={copper} strokeWidth="14" strokeLinecap="round"/>
          <text x="644" y="252" textAnchor="middle" fill={ink} fontFamily="ui-monospace, monospace" fontSize="14" fontWeight="700">847</text>
          {/* bars */}
          <rect x="744" y="290" width="14" height="22" fill={panelStroke}/>
          <rect x="762" y="270" width="14" height="42" fill={accentSoft}/>
          <rect x="780" y="246" width="14" height="66" fill={copper}/>
          {/* lines */}
          <line x1="600" y1="372" x2="680" y2="372" stroke={reportLine} strokeWidth="4" strokeLinecap="round"/>
          <line x1="600" y1="396" x2="720" y2="396" stroke={reportLine} strokeWidth="4" strokeLinecap="round"/>
          <line x1="600" y1="420" x2="652" y2="420" stroke={reportLine} strokeWidth="4" strokeLinecap="round"/>
          {/* eyebrow chips */}
          <rect x="580" y="158" width="56" height="14" rx="1" fill={copper} fillOpacity="0.15"/>
          <text x="586" y="168" fill={copper} fontFamily="ui-monospace, monospace" fontSize="8" letterSpacing="1.2">FLOTA · 142</text>
        </g>

        {/* VEHICLES — animated through phases */}
        <g>
          {vehicles.map(v => {
            const toClusterStart = 0.42 + v.delay * 0.8;
            const toClusterEnd   = 0.58 + v.delay * 0.8;
            const movingW = 1 - smooth(seg(p2, toClusterStart, toClusterEnd));
            const time = p2 * 12 + v.phase * Math.PI * 2;
            const driftX = Math.sin(time) * v.drift[0] * movingW;
            const driftY = Math.cos(time * 0.8) * v.drift[1] * movingW;
            const mapPx = v.map[0] + driftX;
            const mapPy = v.map[1] + driftY;

            const pulseTrigger  = smooth(seg(p2, 0.18, 0.30));
            const pulseCollapse = smooth(seg(p2, 0.36, 0.43));
            const pulseWave = (p2 * 9.0 + v.phase) % 1;
            const openPulseScale = 0.5 + pulseWave * 2.4;
            const collapsedPulseScale = lerp(openPulseScale, 0.0, pulseCollapse);
            const pulseOpacity = pulseTrigger * (1 - pulseCollapse) * (1 - pulseWave);

            const toCluster = smooth(seg(p2, toClusterStart, toClusterEnd));
            const toReport  = smooth(seg(p2, 0.74, 0.86));
            const exit      = 0; // no exit phase — points stay as chart data after arrival

            let x = lerp(mapPx, v.cluster[0], toCluster);
            let y = lerp(mapPy, v.cluster[1], toCluster);
            x = lerp(x, v.report[0], toReport);
            y = lerp(y, v.report[1], toReport);

            const reportExitX = 0;
            const reportExitY = 0;

            // Scale: grow during pulse phase, then SHRINK aggressively when
            // settling into the report so the dots read as small chart data
            // points rather than vehicle pins on the panel.
            const scale = lerp(1, 1.2, smooth(seg(p2, 0.22, 0.38))) * lerp(1, 0.38, toReport);
            const vop = 1;

            const dotColor = v.hot ? copper : (isLight ? 'rgba(12,61,92,0.86)' : 'rgba(245,247,250,0.86)');
            const ringColor = v.hot ? copper : (isLight ? 'rgba(12,61,92,0.45)' : 'rgba(245,247,250,0.55)');
            const dotShadow = v.hot
              ? `drop-shadow(0 0 10px ${copper})`
              : (isLight ? 'none' : 'drop-shadow(0 0 6px rgba(245,247,250,0.65))');

            return (
              <g key={v.id} style={{
                transform: `translate(${x + reportExitX}px, ${y + reportExitY}px) scale(${scale})`,
                opacity: vop,
              }}>
                {/* outer pulse ring */}
                <circle r="15" fill="none" stroke={ringColor} strokeWidth="1.6"
                  style={{
                    transform: `scale(${collapsedPulseScale})`,
                    transformOrigin: 'center',
                    opacity: pulseOpacity * 0.5,
                    vectorEffect: 'non-scaling-stroke',
                  }}/>
                {/* inner pulse ring */}
                <circle r="8" fill="none" stroke={copper} strokeWidth="1.6"
                  style={{
                    transform: `scale(${collapsedPulseScale * 0.6})`,
                    transformOrigin: 'center',
                    opacity: pulseOpacity * 0.8,
                    vectorEffect: 'non-scaling-stroke',
                  }}/>
                {/* dot */}
                <circle r="5.5" fill={dotColor} style={{ filter: dotShadow }}/>
                <circle r="1.8" fill={coreFill}/>
              </g>
            );
          })}
        </g>

        {/* EXIT arrow */}
        <g style={{ opacity: exitT }}>
          <path d="M814 308 L880 308" stroke={copper} strokeWidth="3" strokeLinecap="round"/>
          <path d="M858 286 L880 308 L858 330" fill="none" stroke={copper} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>

      {/* Phase narration chip — bottom-left */}
      <div style={{
        position: 'absolute', left: 18, bottom: 18, right: 18, zIndex: 4,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{
          maxWidth: 320,
          padding: '14px 16px',
          background: cardBg,
          border: `1px solid ${cardStroke}`,
          color: ink, lineHeight: 1.5,
        }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: '0.16em', color: copper, textTransform: 'uppercase', marginBottom: 6 }}>
            {activeLabel.title}
          </div>
          <div style={{ fontSize: 13, color: isLight ? p.inkSub : 'rgba(232,228,220,0.78)' }}>
            {activeLabel.text}
          </div>
        </div>
        {/* progress bar */}
        <div style={{ flexShrink: 0, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: '0.14em', color: strokeMute, textTransform: 'uppercase' }}>
            {String(Math.round(progress * 100)).padStart(2, '0')}%
          </div>
          <div style={{ width: 160, height: 2, background: strokeFaint, position: 'relative' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: copper, transition: 'width 60ms linear' }}/>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {phaseChips.map((_, i) => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: phaseIdx >= i + 0 ? copper : strokeFaint,
                opacity: phaseIdx === i ? 1 : 0.5,
                boxShadow: phaseIdx === i ? `0 0 8px ${copper}` : 'none',
              }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VehicleFlowViz });
