// Generado desde tacografo-scroll.jsx por compilar.mjs: no editar a mano.
const MM = 2.4;
const W = Math.round(178 * MM);
const H = Math.round(72 * MM);
const D = Math.round(145 * MM);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeBackOut = (t, s = 1.2) => {
  const c1 = s, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function Face({ w, h, transform, opacity = 1, children, stroke: stroke2, strokeWidth = 1.25 }) {
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    width: w,
    height: h,
    left: "50%",
    top: "50%",
    marginLeft: -w / 2,
    marginTop: -h / 2,
    transformStyle: "preserve-3d",
    transform,
    opacity,
    pointerEvents: "none"
  } }, /* @__PURE__ */ React.createElement("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}`, style: { overflow: "visible" } }, /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: stroke2, strokeWidth, strokeLinejoin: "round", strokeLinecap: "round" }, children)));
}
function BezelPaths({ stroke: stroke2, copper, mono, drawProgress = 1 }) {
  const displayX = 18, displayY = 14, displayW = 200, displayH = 108;
  const slotX = 18, slotY = 132, slotW = 192, slotH = 22;
  const btnX = 238, btnY = 14, btnSize = 22, btnGap = 4;
  const printerX = 278, printerY = 14, printerW = 132, printerH = 140;
  const dash = 1 - drawProgress;
  return /* @__PURE__ */ React.createElement("g", { style: { strokeDasharray: 2e3, strokeDashoffset: 2e3 * dash, transition: "stroke-dashoffset 0.05s linear" } }, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: W, height: H }), /* @__PURE__ */ React.createElement("rect", { x: displayX, y: displayY, width: displayW, height: displayH, rx: 3 }), /* @__PURE__ */ React.createElement("line", { x1: displayX + 10, y1: displayY + 22, x2: displayX + 110, y2: displayY + 22, opacity: 0.4 }), /* @__PURE__ */ React.createElement("line", { x1: displayX + 10, y1: displayY + 40, x2: displayX + 160, y2: displayY + 40, opacity: 0.4 }), /* @__PURE__ */ React.createElement("line", { x1: displayX + 10, y1: displayY + 60, x2: displayX + 130, y2: displayY + 60, opacity: 0.4 }), /* @__PURE__ */ React.createElement("line", { x1: displayX + 10, y1: displayY + 80, x2: displayX + 90, y2: displayY + 80, opacity: 0.4 }), /* @__PURE__ */ React.createElement("text", { x: displayX + 175, y: displayY + 22, fill: copper, stroke: "none", fontSize: "8", fontFamily: mono, textAnchor: "end", opacity: 0.7 }, "08:42"), /* @__PURE__ */ React.createElement("rect", { x: slotX, y: slotY, width: slotW, height: slotH, rx: 2 }), /* @__PURE__ */ React.createElement("line", { x1: slotX + 8, y1: slotY + slotH / 2, x2: slotX + 36, y2: slotY + slotH / 2, stroke: copper, strokeWidth: 1.5, opacity: 0.85 }), /* @__PURE__ */ React.createElement("text", { x: slotX + slotW - 8, y: slotY + 14, fill: copper, stroke: "none", fontSize: "7", fontFamily: mono, textAnchor: "end", opacity: 0.6, letterSpacing: "1.5" }, "DRIVER"), [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ React.createElement("rect", { key: i, x: btnX, y: btnY + i * (btnSize + btnGap), width: btnSize, height: btnSize, rx: 3 })), /* @__PURE__ */ React.createElement("circle", { cx: btnX + btnSize / 2, cy: btnY + btnSize / 2, r: 3.5, stroke: copper }), /* @__PURE__ */ React.createElement("path", { d: `M ${btnX + btnSize / 2 - 4} ${btnY + (btnSize + btnGap) + btnSize - 8} l 4 -6 l 4 6 z`, stroke: copper }), /* @__PURE__ */ React.createElement("path", { d: `M ${btnX + btnSize / 2 - 4} ${btnY + 2 * (btnSize + btnGap) + 8} l 4 6 l 4 -6 z`, stroke: copper }), /* @__PURE__ */ React.createElement("text", { x: btnX + btnSize / 2, y: btnY + 3 * (btnSize + btnGap) + btnSize / 2 + 4, fill: copper, stroke: "none", fontSize: "11", fontFamily: mono, textAnchor: "middle" }, "M"), /* @__PURE__ */ React.createElement("rect", { x: btnX + 6, y: btnY + 4 * (btnSize + btnGap) + 8, width: 10, height: 6, stroke: copper }), /* @__PURE__ */ React.createElement("rect", { x: printerX, y: printerY, width: printerW, height: printerH, rx: 3 }), /* @__PURE__ */ React.createElement("line", { x1: printerX + 10, y1: printerY + 10, x2: printerX + printerW - 10, y2: printerY + 10, opacity: 0.35 }), /* @__PURE__ */ React.createElement("line", { x1: printerX + 10, y1: printerY + 18, x2: printerX + printerW - 10, y2: printerY + 18, opacity: 0.25 }), /* @__PURE__ */ React.createElement("rect", { x: printerX + 12, y: printerY + 30, width: printerW - 24, height: printerH - 60, opacity: 0.5 }), /* @__PURE__ */ React.createElement("circle", { cx: printerX + printerW / 2, cy: printerY + printerH - 14, r: 3.5 }), /* @__PURE__ */ React.createElement("text", { x: printerX + printerW / 2, y: printerY + printerH - 4, fill: copper, stroke: "none", fontSize: "6.5", fontFamily: mono, textAnchor: "middle", opacity: 0.6, letterSpacing: "1.2" }, "PRINTER"));
}
function PCBPaths({ stroke: stroke2, copper, chipFill = "#05131f" }) {
  const w = W - 30, h = D - 10;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: 4, y: 4, width: w - 8, height: h - 8, rx: 3, stroke: copper, opacity: 0.5 }), /* @__PURE__ */ React.createElement("rect", { x: w / 2 - 30, y: 14, width: 60, height: 14, stroke: stroke2, opacity: 0.6 }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 24} 14 L ${w / 2 - 24} 4`, stroke: copper, strokeWidth: 1.2 }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 24} 14 L ${w / 2 + 24} 4`, stroke: copper, strokeWidth: 1.2 }), /* @__PURE__ */ React.createElement("g", { stroke: copper, fill: "none", opacity: 0.55, strokeWidth: 1 }, /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 36} 150 L 130 150 L 130 114 L 120 114` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 36} 160 L 134 160 L 134 122 L 120 122` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 36} 180 L 130 180 L 130 200 L 120 200` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 36} 190 L 134 190 L 134 208 L 120 208` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 36} 140 L 250 140 L 250 140 L 260 140` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 36} 148 L 254 148 L 254 168 L 260 168` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 36} 156 L 256 156 L 256 142 L 260 142` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 20} 130 L ${w / 2 + 20} 78 L 290 78 L 290 72` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 28} 130 L ${w / 2 + 28} 84 L 296 84 L 296 72` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 16} 130 L ${w / 2 - 16} 28` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 8} 130 L ${w / 2 - 8} 28` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 8} 130 L ${w / 2 + 8} 28` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 16} 130 L ${w / 2 + 16} 28` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 24} 202 L ${w / 2 - 24} ${h - 70} L 90 ${h - 70} L 90 ${h - 60}` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 - 12} 202 L ${w / 2 - 12} ${h - 66} L 130 ${h - 66} L 130 ${h - 60}` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2} 202 L ${w / 2} ${h - 60}` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 12} 202 L ${w / 2 + 12} ${h - 66} L 215 ${h - 66} L 215 ${h - 60}` }), /* @__PURE__ */ React.createElement("path", { d: `M ${w / 2 + 24} 202 L ${w / 2 + 24} ${h - 70} L 315 ${h - 70} L 315 ${h - 60}` })), /* @__PURE__ */ React.createElement("rect", { x: w / 2 - 36, y: 130, width: 72, height: 72, stroke: stroke2, fill: chipFill }), /* @__PURE__ */ React.createElement("rect", { x: w / 2 - 30, y: 136, width: 60, height: 60, stroke: stroke2, opacity: 0.4, fill: "none" }), /* @__PURE__ */ React.createElement("text", { x: w / 2, y: 172, fill: stroke2, stroke: "none", fontSize: "9", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.65 }, "SoC"), /* @__PURE__ */ React.createElement("text", { x: w / 2, y: 184, fill: stroke2, stroke: "none", fontSize: "6", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.45 }, "i.MX"), [0, 1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ React.createElement("line", { key: `pt-${i}`, x1: w / 2 - 36 + 10 + i * 8, y1: 130, x2: w / 2 - 36 + 10 + i * 8, y2: 125, stroke: stroke2, opacity: 0.55 })), [0, 1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ React.createElement("line", { key: `pb-${i}`, x1: w / 2 - 36 + 10 + i * 8, y1: 202, x2: w / 2 - 36 + 10 + i * 8, y2: 207, stroke: stroke2, opacity: 0.55 })), [0, 1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ React.createElement("line", { key: `pl-${i}`, x1: w / 2 - 36, y1: 130 + 10 + i * 8, x2: w / 2 - 41, y2: 130 + 10 + i * 8, stroke: stroke2, opacity: 0.55 })), [0, 1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ React.createElement("line", { key: `pr-${i}`, x1: w / 2 + 36, y1: 130 + 10 + i * 8, x2: w / 2 + 41, y2: 130 + 10 + i * 8, stroke: stroke2, opacity: 0.55 })), [[w / 2 - 32, 134], [w / 2 + 32, 134], [w / 2 - 32, 198], [w / 2 + 32, 198]].map(([cx, cy], i) => /* @__PURE__ */ React.createElement("g", { key: `scr-${i}` }, /* @__PURE__ */ React.createElement("circle", { cx, cy, r: 3, stroke: copper, strokeWidth: 1.2, fill: "none", opacity: 0.95 }), /* @__PURE__ */ React.createElement("line", { x1: cx - 2, y1: cy, x2: cx + 2, y2: cy, stroke: copper, strokeWidth: 1, opacity: 0.9 }))), /* @__PURE__ */ React.createElement("rect", { x: 40, y: 90, width: 80, height: 48, stroke: stroke2, fill: chipFill }), /* @__PURE__ */ React.createElement("text", { x: 80, y: 114, fill: stroke2, stroke: "none", fontSize: "8", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.6 }, "GNSS"), /* @__PURE__ */ React.createElement("text", { x: 80, y: 126, fill: stroke2, stroke: "none", fontSize: "6", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.4 }, "u-blox"), /* @__PURE__ */ React.createElement("circle", { cx: 106, cy: 96, r: 2.5, stroke: copper, opacity: 0.7 }), [0, 1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ React.createElement("line", { key: `gn-${i}`, x1: 40 + 8 + i * 12, y1: 138, x2: 40 + 8 + i * 12, y2: 143, stroke: stroke2, opacity: 0.5 })), /* @__PURE__ */ React.createElement("rect", { x: 40, y: 180, width: 80, height: 48, stroke: stroke2, fill: chipFill }), /* @__PURE__ */ React.createElement("text", { x: 80, y: 204, fill: stroke2, stroke: "none", fontSize: "8", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.6 }, "LTE 4G"), /* @__PURE__ */ React.createElement("text", { x: 80, y: 216, fill: stroke2, stroke: "none", fontSize: "6", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.4 }, "Cat-M1"), /* @__PURE__ */ React.createElement("circle", { cx: 106, cy: 186, r: 2.5, stroke: copper, opacity: 0.7 }), [0, 1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ React.createElement("line", { key: `lt-${i}`, x1: 40 + 8 + i * 12, y1: 228, x2: 40 + 8 + i * 12, y2: 233, stroke: stroke2, opacity: 0.5 })), /* @__PURE__ */ React.createElement("rect", { x: 260, y: 130, width: 30, height: 20, stroke: stroke2, opacity: 0.85, fill: chipFill }), /* @__PURE__ */ React.createElement("rect", { x: 260, y: 158, width: 30, height: 20, stroke: stroke2, opacity: 0.85, fill: chipFill }), /* @__PURE__ */ React.createElement("text", { x: 296, y: 146, fill: stroke2, stroke: "none", fontSize: "6", fontFamily: "ui-monospace, monospace", opacity: 0.5 }, "FLASH 8G"), /* @__PURE__ */ React.createElement("text", { x: 296, y: 174, fill: stroke2, stroke: "none", fontSize: "6", fontFamily: "ui-monospace, monospace", opacity: 0.5 }, "RAM"), [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement("line", { key: `fl-${i}`, x1: 260 + 4 + i * 7, y1: 150, x2: 260 + 4 + i * 7, y2: 155, stroke: stroke2, opacity: 0.5 })), [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement("line", { key: `rm-${i}`, x1: 260 + 4 + i * 7, y1: 178, x2: 260 + 4 + i * 7, y2: 183, stroke: stroke2, opacity: 0.5 })), /* @__PURE__ */ React.createElement("rect", { x: 280, y: 50, width: 100, height: 22, stroke: stroke2, fill: chipFill }), /* @__PURE__ */ React.createElement("text", { x: 330, y: 64, fill: stroke2, stroke: "none", fontSize: "7", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.65 }, "PRINT HEAD"), /* @__PURE__ */ React.createElement("path", { d: `M 330 72 Q 330 90 360 100 L 380 100 L 380 200`, stroke: copper, strokeWidth: 1.5, opacity: 0.8, fill: "none" }), /* @__PURE__ */ React.createElement("rect", { x: 30, y: h - 60, width: 120, height: 36, stroke: stroke2, fill: chipFill }), /* @__PURE__ */ React.createElement("text", { x: 90, y: h - 38, fill: stroke2, stroke: "none", fontSize: "7", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.6 }, "POWER · CAN A/B"), /* @__PURE__ */ React.createElement("rect", { x: 170, y: h - 60, width: 90, height: 36, stroke: stroke2, fill: chipFill }), /* @__PURE__ */ React.createElement("text", { x: 215, y: h - 38, fill: stroke2, stroke: "none", fontSize: "7", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.6 }, "I/O"), /* @__PURE__ */ React.createElement("rect", { x: 280, y: h - 60, width: 70, height: 36, stroke: stroke2, fill: chipFill }), /* @__PURE__ */ React.createElement("text", { x: 315, y: h - 38, fill: stroke2, stroke: "none", fontSize: "7", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.6 }, "GNSS ANT"), [0, 1, 2, 3, 4, 5, 6, 7].map((i) => /* @__PURE__ */ React.createElement("line", { key: `pc-${i}`, x1: 30 + 8 + i * 14, y1: h - 60, x2: 30 + 8 + i * 14, y2: h - 65, stroke: stroke2, opacity: 0.5 })), [0, 1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ React.createElement("line", { key: `io-${i}`, x1: 170 + 8 + i * 14, y1: h - 60, x2: 170 + 8 + i * 14, y2: h - 65, stroke: stroke2, opacity: 0.5 })), [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement("line", { key: `ga-${i}`, x1: 280 + 8 + i * 14, y1: h - 60, x2: 280 + 8 + i * 14, y2: h - 65, stroke: stroke2, opacity: 0.5 })), /* @__PURE__ */ React.createElement("circle", { cx: 15, cy: 15, r: 4, stroke: copper, opacity: 0.8, fill: chipFill }), /* @__PURE__ */ React.createElement("circle", { cx: 15, cy: 15, r: 1.5, fill: copper, stroke: "none", opacity: 0.6 }), /* @__PURE__ */ React.createElement("circle", { cx: w - 15, cy: 15, r: 4, stroke: copper, opacity: 0.8, fill: chipFill }), /* @__PURE__ */ React.createElement("circle", { cx: w - 15, cy: 15, r: 1.5, fill: copper, stroke: "none", opacity: 0.6 }), /* @__PURE__ */ React.createElement("circle", { cx: 15, cy: h - 15, r: 4, stroke: copper, opacity: 0.8, fill: chipFill }), /* @__PURE__ */ React.createElement("circle", { cx: 15, cy: h - 15, r: 1.5, fill: copper, stroke: "none", opacity: 0.6 }), /* @__PURE__ */ React.createElement("circle", { cx: w - 15, cy: h - 15, r: 4, stroke: copper, opacity: 0.8, fill: chipFill }), /* @__PURE__ */ React.createElement("circle", { cx: w - 15, cy: h - 15, r: 1.5, fill: copper, stroke: "none", opacity: 0.6 }));
}
function PanelDetail({ w, h, stroke: stroke2, copper, kind }) {
  return /* @__PURE__ */ React.createElement("g", { opacity: 0.85 }, /* @__PURE__ */ React.createElement("rect", { x: 0, y: 0, width: w, height: h }), kind === "top" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("text", { x: w / 2, y: h / 2 - 4, fill: copper, stroke: "none", fontSize: "11", fontFamily: "ui-monospace, monospace", textAnchor: "middle", letterSpacing: "2.5", opacity: 0.7 }, "ANDES ELECTRÓNICA"), /* @__PURE__ */ React.createElement("text", { x: w / 2, y: h / 2 + 14, fill: stroke2, stroke: "none", fontSize: "8", fontFamily: "ui-monospace, monospace", textAnchor: "middle", letterSpacing: "1.5", opacity: 0.5 }, "TACÓGRAFO 4.0 · MODEL AE-T40 · IP54"), [0, 1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ React.createElement("line", { key: `v-${i}`, x1: 50 + i * 60, y1: h - 24, x2: 90 + i * 60, y2: h - 24, opacity: 0.4 })), /* @__PURE__ */ React.createElement("circle", { cx: 24, cy: 24, r: 4, opacity: 0.5 }), /* @__PURE__ */ React.createElement("circle", { cx: w - 24, cy: 24, r: 4, opacity: 0.5 }), /* @__PURE__ */ React.createElement("circle", { cx: 24, cy: h - 24, r: 4, opacity: 0.5 }), /* @__PURE__ */ React.createElement("circle", { cx: w - 24, cy: h - 24, r: 4, opacity: 0.5 })), kind === "side" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("line", { x1: 20, y1: 18, x2: w - 20, y2: 18, opacity: 0.5 }), /* @__PURE__ */ React.createElement("line", { x1: 20, y1: h - 18, x2: w - 20, y2: h - 18, opacity: 0.5 }), [0, 1, 2, 3, 4, 5, 6, 7].map((i) => /* @__PURE__ */ React.createElement("line", { key: `vs-${i}`, x1: 40 + i * 38, y1: h / 2, x2: 70 + i * 38, y2: h / 2, opacity: 0.35 })), [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement("circle", { key: `mh-${i}`, cx: 60 + i * 110, cy: h / 2 - 28, r: 3, opacity: 0.5 }))), kind === "back" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: 30, y: 30, width: 130, height: 70, opacity: 0.55 }), /* @__PURE__ */ React.createElement("rect", { x: 170, y: 30, width: 90, height: 70, opacity: 0.55 }), /* @__PURE__ */ React.createElement("rect", { x: 270, y: 30, width: 70, height: 70, opacity: 0.55 }), [0, 1, 2, 3, 4, 5].map((c) => [0, 1, 2].map((r) => /* @__PURE__ */ React.createElement("circle", { key: `p1-${c}-${r}`, cx: 45 + c * 20, cy: 45 + r * 18, r: 2, opacity: 0.5, stroke: copper }))), [0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => /* @__PURE__ */ React.createElement("circle", { key: `p2-${c}-${r}`, cx: 185 + c * 18, cy: 45 + r * 18, r: 2, opacity: 0.5, stroke: copper }))), [0, 1, 2].map((c) => [0, 1, 2].map((r) => /* @__PURE__ */ React.createElement("circle", { key: `p3-${c}-${r}`, cx: 285 + c * 18, cy: 45 + r * 18, r: 2, opacity: 0.5, stroke: copper }))), /* @__PURE__ */ React.createElement("text", { x: 95, y: 120, fill: stroke2, stroke: "none", fontSize: "8", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.55 }, "POWER · CAN-A · CAN-B"), /* @__PURE__ */ React.createElement("text", { x: 215, y: 120, fill: stroke2, stroke: "none", fontSize: "8", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.55 }, "I/O"), /* @__PURE__ */ React.createElement("text", { x: 305, y: 120, fill: stroke2, stroke: "none", fontSize: "8", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.55 }, "GNSS"), /* @__PURE__ */ React.createElement("rect", { x: 30, y: 138, width: 130, height: 28, opacity: 0.45 }), /* @__PURE__ */ React.createElement("text", { x: 95, y: 156, fill: copper, stroke: "none", fontSize: "7.5", fontFamily: "ui-monospace, monospace", textAnchor: "middle", opacity: 0.7 }, "S/N · CE · e1 R141"), /* @__PURE__ */ React.createElement("circle", { cx: 395, cy: H / 2, r: 10, stroke: stroke2, opacity: 0.7 }), /* @__PURE__ */ React.createElement("circle", { cx: 395, cy: H / 2, r: 4, stroke: copper, opacity: 0.7 })));
}
function Chip3D({ w, d, h, x, z, label, sublabel, stroke: stroke2, copper, mono, accent }) {
  const top = /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    width: w,
    height: d,
    left: "50%",
    top: "50%",
    marginLeft: -w / 2,
    marginTop: -d / 2,
    transform: `translate3d(${x}px, ${-h}px, ${z}px) rotateX(90deg)`,
    transformStyle: "preserve-3d"
  } }, /* @__PURE__ */ React.createElement("svg", { width: w, height: d, viewBox: `0 0 ${w} ${d}`, style: { overflow: "visible" } }, /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: stroke2, strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("rect", { x: 0.5, y: 0.5, width: w - 1, height: d - 1, stroke: accent || stroke2, strokeWidth: 1.2 }), label && /* @__PURE__ */ React.createElement("text", { x: w / 2, y: d / 2 + 2, fill: stroke2, stroke: "none", fontSize: "8", fontFamily: mono, textAnchor: "middle", opacity: 0.75 }, label), sublabel && /* @__PURE__ */ React.createElement("text", { x: w / 2, y: d / 2 + 14, fill: stroke2, stroke: "none", fontSize: "6", fontFamily: mono, textAnchor: "middle", opacity: 0.5 }, sublabel))));
  const front = /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    width: w,
    height: h,
    left: "50%",
    top: "50%",
    marginLeft: -w / 2,
    marginTop: -h / 2,
    transform: `translate3d(${x}px, ${-h / 2}px, ${z + d / 2}px)`,
    transformStyle: "preserve-3d"
  } }, /* @__PURE__ */ React.createElement("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}`, style: { overflow: "visible" } }, /* @__PURE__ */ React.createElement("rect", { x: 0.5, y: 0.5, width: w - 1, height: h - 1, fill: "none", stroke: stroke2, strokeWidth: 1, opacity: 0.7 })));
  const right = /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    width: d,
    height: h,
    left: "50%",
    top: "50%",
    marginLeft: -d / 2,
    marginTop: -h / 2,
    transform: `translate3d(${x + w / 2}px, ${-h / 2}px, ${z}px) rotateY(90deg)`,
    transformStyle: "preserve-3d"
  } }, /* @__PURE__ */ React.createElement("svg", { width: d, height: h, viewBox: `0 0 ${d} ${h}`, style: { overflow: "visible" } }, /* @__PURE__ */ React.createElement("rect", { x: 0.5, y: 0.5, width: d - 1, height: h - 1, fill: "none", stroke: stroke2, strokeWidth: 1, opacity: 0.6 })));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, top, front, right);
}
function PCBGroup({ stroke: stroke2, copper, mono, opacity }) {
  const pcbW = W - 30, pcbD = D - 10;
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: 0,
    transformStyle: "preserve-3d",
    opacity,
    transition: "opacity 0.1s linear"
  } }, /* @__PURE__ */ React.createElement(
    Face,
    {
      w: pcbW,
      h: pcbD,
      stroke: stroke2,
      transform: `translateY(${H / 2 - 4}px) rotateX(90deg)`
    },
    /* @__PURE__ */ React.createElement("rect", { x: 2, y: 2, width: pcbW - 4, height: pcbD - 4, rx: 3, stroke: copper, opacity: 0.5 }),
    [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ React.createElement("line", { key: `tx-${i}`, x1: 20, y1: 50 + i * 60, x2: pcbW - 20, y2: 50 + i * 60, stroke: stroke2, opacity: 0.12 })),
    [0, 1, 2, 3, 4, 5, 6, 7].map((i) => /* @__PURE__ */ React.createElement("line", { key: `tz-${i}`, x1: 40 + i * 45, y1: 20, x2: 40 + i * 45, y2: pcbD - 20, stroke: stroke2, opacity: 0.12 })),
    /* @__PURE__ */ React.createElement("circle", { cx: 14, cy: 14, r: 4, stroke: copper, opacity: 0.7 }),
    /* @__PURE__ */ React.createElement("circle", { cx: pcbW - 14, cy: 14, r: 4, stroke: copper, opacity: 0.7 }),
    /* @__PURE__ */ React.createElement("circle", { cx: 14, cy: pcbD - 14, r: 4, stroke: copper, opacity: 0.7 }),
    /* @__PURE__ */ React.createElement("circle", { cx: pcbW - 14, cy: pcbD - 14, r: 4, stroke: copper, opacity: 0.7 })
  ), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateY(${H / 2 - 4}px)` } }, /* @__PURE__ */ React.createElement(Chip3D, { w: 68, d: 68, h: 28, x: 0, z: 0, label: "SoC", sublabel: "i.MX 8M", stroke: stroke2, copper, mono, accent: copper }), /* @__PURE__ */ React.createElement(Chip3D, { w: 70, d: 42, h: 12, x: -130, z: -90, label: "GNSS", sublabel: "u-blox", stroke: stroke2, copper, mono }), /* @__PURE__ */ React.createElement(Chip3D, { w: 70, d: 42, h: 12, x: -130, z: 30, label: "LTE 4G", sublabel: "Cat-M1", stroke: stroke2, copper, mono }), /* @__PURE__ */ React.createElement(Chip3D, { w: 32, d: 22, h: 7, x: 80, z: -30, label: "FLASH", stroke: stroke2, copper, mono }), /* @__PURE__ */ React.createElement(Chip3D, { w: 32, d: 22, h: 7, x: 120, z: -30, label: "RAM", stroke: stroke2, copper, mono }), /* @__PURE__ */ React.createElement(Chip3D, { w: 120, d: 24, h: 32, x: 80, z: -110, label: "PRINT HEAD", stroke: stroke2, copper, mono, accent: copper }), /* @__PURE__ */ React.createElement(Chip3D, { w: 130, d: 36, h: 28, x: -110, z: 135, label: "POWER · CAN", stroke: stroke2, copper, mono }), /* @__PURE__ */ React.createElement(Chip3D, { w: 80, d: 36, h: 28, x: 0, z: 135, label: "I/O", stroke: stroke2, copper, mono }), /* @__PURE__ */ React.createElement(Chip3D, { w: 70, d: 36, h: 28, x: 110, z: 135, label: "GNSS", stroke: stroke2, copper, mono })));
}
function Callout({ num, label, x, y, lineTo, copper, mono, visible }) {
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: x,
    top: y,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
    pointerEvents: "none",
    zIndex: 5
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: mono,
    fontSize: 11,
    color: copper,
    border: `1px solid ${copper}`,
    padding: "2px 6px",
    borderRadius: 2,
    letterSpacing: "0.08em"
  } }, num), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: mono, fontSize: 11, color: stroke, letterSpacing: "0.06em", textTransform: "uppercase" } }, label)), lineTo && /* @__PURE__ */ React.createElement("svg", { style: { position: "absolute", left: 0, top: 12, overflow: "visible", pointerEvents: "none" }, width: 1, height: 1 }, /* @__PURE__ */ React.createElement("line", { x1: 0, y1: 0, x2: lineTo.dx, y2: lineTo.dy, stroke: copper, strokeWidth: 1, strokeDasharray: "2 3", opacity: 0.7 })));
}
function TacografoScroll({ theme }) {
  const { p, copper, mono, display, ink, inkSoft } = theme;
  const wrapRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const [fitScale, setFitScale] = React.useState(1);
  React.useEffect(() => {
    const onResize = () => {
      const sx = (window.innerWidth - 144) / 427;
      const sy = (window.innerHeight - 200) / 560;
      setFitScale(Math.min(1, Math.max(0.45, Math.min(sx, sy))));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  React.useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const t = clamp01(-rect.top / total);
      setProgress(t);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const a1 = clamp01(progress / 0.25);
  const a2 = clamp01((progress - 0.25) / 0.25);
  const a3 = clamp01((progress - 0.5) / 0.25);
  const a4 = clamp01((progress - 0.75) / 0.25);
  const camX_base = lerp(0, -22, easeInOut(a2));
  const camY_base = lerp(0, -28, easeInOut(a2));
  const orbitActive = a3 > 0 && a4 === 0;
  const camX = camX_base + (orbitActive ? Math.sin(a3 * Math.PI * 2) * 1 : 0);
  const camY = camY_base + (orbitActive ? Math.sin(a3 * Math.PI) * 3 : 0);
  const breath = orbitActive ? 1 + Math.sin(a3 * Math.PI * 2) * 4e-3 : 1;
  const bodyOpacity = easeOut(a2);
  const drawBack = 1 - easeOut(clamp01(a2 / 0.35));
  const drawBottom = 1 - easeOut(clamp01((a2 - 0.15) / 0.35));
  const drawTop = 1 - easeOut(clamp01((a2 - 0.3) / 0.35));
  const drawSides = 1 - easeOut(clamp01((a2 - 0.45) / 0.35));
  const drawPCB = 1 - easeOut(clamp01((a2 - 0.6) / 0.4));
  const dashWrap = (offset) => ({
    strokeDasharray: 1400,
    strokeDashoffset: 1400 * offset,
    transition: "stroke-dashoffset 0.08s linear"
  });
  const a4_unlatch = clamp01(a4 / 0.28);
  const a4_lift = clamp01((a4 - 0.35) / 0.65);
  const coverZ = -lerp(0, 4 * MM, easeOut(a4_unlatch));
  const coverY = -lerp(0, 60 * MM, easeBackOut(a4_lift));
  const pcbOpacity = easeOut(a4_lift);
  const calloutSet = a4 > 0.15 ? "inner" : a3 > 0.05 || a2 >= 1 ? "outer" : "none";
  const isLight = theme.palette === "light";
  const stroke2 = isLight ? "rgba(12,61,92,0.85)" : "rgba(232,228,220,0.85)";
  const strokeFaint = isLight ? "rgba(12,61,92,0.55)" : "rgba(232,228,220,0.55)";
  const strokeMute = isLight ? "rgba(12,61,92,0.45)" : "rgba(232,228,220,0.45)";
  const strokeDim = isLight ? "rgba(12,61,92,0.30)" : "rgba(232,228,220,0.30)";
  const strokeSoft = isLight ? "rgba(12,61,92,0.60)" : "rgba(232,228,220,0.60)";
  const gridLine = isLight ? "rgba(12,61,92,0.06)" : "rgba(232,228,220,0.04)";
  const wash = "transparent";
  const chipFill = p.deep;
  return /* @__PURE__ */ React.createElement("div", { ref: wrapRef, style: { height: "320vh", position: "relative", background: wash } }, /* @__PURE__ */ React.createElement("div", { style: { position: "sticky", top: 0, height: "100vh", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
    backgroundSize: "64px 64px"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 36,
    left: 72,
    right: 72,
    zIndex: 4,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontFamily: mono,
    fontSize: 11,
    color: strokeFaint,
    letterSpacing: "0.18em",
    textTransform: "uppercase"
  } }, /* @__PURE__ */ React.createElement("span", null, "— Anatomía técnica"), /* @__PURE__ */ React.createElement("span", null, "Tacógrafo 4.0 · AE-T40")), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: 2e3
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    width: W,
    height: H,
    transformStyle: "preserve-3d",
    transform: `scale(${fitScale}) rotateX(${camX}deg) rotateY(${camY}deg) scale(${breath})`,
    transition: "transform 0.05s linear"
  } }, /* @__PURE__ */ React.createElement(
    Face,
    {
      w: W,
      h: H,
      stroke: stroke2,
      transform: `translateZ(${D / 2}px)`
    },
    /* @__PURE__ */ React.createElement(BezelPaths, { stroke: stroke2, copper, mono, drawProgress: a1 })
  ), /* @__PURE__ */ React.createElement(
    Face,
    {
      w: W,
      h: D,
      stroke: stroke2,
      transform: `translateY(${H / 2}px) rotateX(-90deg) translateZ(${D / 2}px)`
    },
    /* @__PURE__ */ React.createElement("g", { style: { opacity: bodyOpacity * 0.65, transition: "opacity 0.1s linear", ...dashWrap(drawBottom) } }, /* @__PURE__ */ React.createElement("rect", { x: 2, y: 2, width: W - 4, height: D - 4, rx: 3 }))
  ), /* @__PURE__ */ React.createElement(
    Face,
    {
      w: W,
      h: H,
      stroke: stroke2,
      transform: `rotateY(180deg) translateZ(${D / 2}px)`
    },
    /* @__PURE__ */ React.createElement("g", { style: { opacity: bodyOpacity, transition: "opacity 0.1s linear", ...dashWrap(drawBack) } }, /* @__PURE__ */ React.createElement(PanelDetail, { w: W, h: H, stroke: stroke2, copper, kind: "back" }))
  ), /* @__PURE__ */ React.createElement(PCBGroup, { stroke: stroke2, copper, mono, opacity: pcbOpacity }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: 0,
    transformStyle: "preserve-3d",
    transform: `translate3d(0, ${coverY}px, ${coverZ}px)`
  } }, /* @__PURE__ */ React.createElement(
    Face,
    {
      w: W,
      h: D,
      stroke: stroke2,
      transform: `translateY(${-H / 2}px) rotateX(90deg) translateZ(${D / 2}px)`
    },
    /* @__PURE__ */ React.createElement("g", { style: { opacity: bodyOpacity, transition: "opacity 0.1s linear", ...dashWrap(drawTop) } }, /* @__PURE__ */ React.createElement(PanelDetail, { w: W, h: D, stroke: stroke2, copper, kind: "top" }))
  ), /* @__PURE__ */ React.createElement(
    Face,
    {
      w: D,
      h: H,
      stroke: stroke2,
      transform: `translateX(${-W / 2}px) rotateY(-90deg) translateZ(${D / 2}px)`
    },
    /* @__PURE__ */ React.createElement("g", { style: { opacity: bodyOpacity, transition: "opacity 0.1s linear", ...dashWrap(drawSides) } }, /* @__PURE__ */ React.createElement(PanelDetail, { w: D, h: H, stroke: stroke2, copper, kind: "side" }))
  ), /* @__PURE__ */ React.createElement(
    Face,
    {
      w: D,
      h: H,
      stroke: stroke2,
      transform: `translateX(${W / 2}px) rotateY(90deg) translateZ(${D / 2}px)`
    },
    /* @__PURE__ */ React.createElement("g", { style: { opacity: bodyOpacity, transition: "opacity 0.1s linear", ...dashWrap(drawSides) } }, /* @__PURE__ */ React.createElement(PanelDetail, { w: D, h: H, stroke: stroke2, copper, kind: "side" }))
  )))), calloutSet === "outer" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Callout, { num: "01", label: "Slot tarjeta conductor", x: "14%", y: "46%", copper, mono, visible: a3 > 0.05 || a2 >= 0.6 }), /* @__PURE__ */ React.createElement(Callout, { num: "02", label: "Display información operativa", x: "14%", y: "32%", copper, mono, visible: a3 > 0.15 || a2 >= 0.7 }), /* @__PURE__ */ React.createElement(Callout, { num: "03", label: "Carcasa IP54 anti-tamper", x: "72%", y: "28%", copper, mono, visible: a3 > 0.3 || a2 >= 0.85 }), /* @__PURE__ */ React.createElement(Callout, { num: "04", label: "178 × 130 × 50 mm", x: "72%", y: "62%", copper, mono, visible: a3 > 0.45 || a2 >= 1 })), calloutSet === "inner" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Callout, { num: "05", label: "PCB · CPU + GPS + LTE 4G", x: "14%", y: "40%", copper, mono, visible: a4 > 0.2 }), /* @__PURE__ */ React.createElement(Callout, { num: "06", label: "Cabezal térmico 8 dots/mm", x: "72%", y: "32%", copper, mono, visible: a4 > 0.4 }), /* @__PURE__ */ React.createElement(Callout, { num: "07", label: "Flex cable 24 vías", x: "72%", y: "52%", copper, mono, visible: a4 > 0.55 }), /* @__PURE__ */ React.createElement(Callout, { num: "08", label: "Tapa metálica · sleeve DIN", x: "46%", y: "14%", copper, mono, visible: a4 > 0.7 })), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    bottom: 32,
    left: 72,
    right: 72,
    zIndex: 4,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: mono,
    fontSize: 10,
    color: strokeMute,
    letterSpacing: "0.16em",
    textTransform: "uppercase"
  } }, /* @__PURE__ */ React.createElement("span", null, "Scroll para explorar"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, ["01 frontal", "02 ensamble", "03 cerrado", "04 interior"].map((s, i) => {
    const acts = [a1, a2, a3, a4];
    const active = acts[i] > 0.15;
    const done = i < 3 && acts[i + 1] > 0;
    return /* @__PURE__ */ React.createElement("span", { key: i, style: {
      color: active ? copper : done ? strokeSoft : strokeDim,
      fontWeight: active ? 600 : 400,
      marginRight: 12
    } }, s);
  }), /* @__PURE__ */ React.createElement("span", { style: { marginLeft: 12, color: copper } }, Math.round(progress * 100), "%")))));
}
Object.assign(window, { TacografoScroll });
