// Original, stylized side-profile illustrations for each body type, drawn as
// three stacked layers: Classic (silhouette), Blueprint (wireframe + fitment
// parts) and Electric (drivetrain layout). No manufacturer artwork is used.
import { esc } from './html.mjs';

const GROUND = 262;
const WHEEL_Y = 224;
const WHEEL_R = 36;
const ARCH_R = 45;
const SILL = 222;

// Each profile: `top` is a path from the front sill, over the body, to the rear sill.
const PROFILES = {
  truck: {
    top: 'M50 222 L48 172 Q50 160 64 158 L250 151 Q282 150 292 146 L334 96 L432 94 L440 146 L452 144 L752 144 L756 222',
    wheels: [168, 640],
    glass: ['M340 104 L304 142 L428 142 L426 102 Z'],
    lines: ['M446 146 L446 222', 'M60 186 L240 182'],
  },
  suv: {
    top: 'M72 222 L70 170 Q72 158 86 156 L238 150 Q258 149 266 144 L302 90 L612 88 Q630 88 632 100 L636 222',
    wheels: [172, 540],
    glass: ['M308 98 L276 140 L438 140 L438 98 Z', 'M452 98 L452 140 L614 140 L614 98 Z'],
    lines: ['M445 90 L445 222', 'M80 184 L250 180'],
  },
  bug: {
    top: 'M92 222 C90 192 110 176 168 168 C232 160 268 94 380 84 C482 76 562 104 640 162 C688 182 714 200 712 222',
    wheels: [206, 590],
    glass: ['M296 150 C318 112 360 100 420 98 L424 150 Z', 'M440 98 C500 100 540 122 566 150 L440 150 Z'],
    lines: ['M432 152 L432 214'],
  },
  coupe: {
    top: 'M70 222 C70 202 80 188 120 182 C200 172 262 160 302 150 C350 106 400 94 470 96 C560 100 640 150 718 180 C736 188 742 204 740 222',
    wheels: [190, 600],
    glass: ['M320 150 C360 112 398 104 440 104 L446 150 Z', 'M460 104 C520 108 560 128 598 150 L460 150 Z'],
    lines: ['M452 152 L452 214'],
  },
  roadster: {
    top: 'M60 222 C60 202 72 190 112 184 C200 176 280 170 330 166 L382 122 L398 122 L394 166 C500 166 640 168 716 176 C738 182 744 202 742 222',
    wheels: [180, 612],
    glass: ['M340 164 L384 128 L390 128 L388 164 Z'],
    lines: ['M420 166 C450 150 500 150 530 166'],
  },
};

function bodyPath(p) {
  const [front, rear] = p.wheels;
  const firstX = p.top.match(/^M(\d+)/)[1];
  return `${p.top} L${rear + ARCH_R} ${SILL} A${ARCH_R} ${ARCH_R} 0 0 0 ${rear - ARCH_R} ${SILL} L${front + ARCH_R} ${SILL} A${ARCH_R} ${ARCH_R} 0 0 0 ${front - ARCH_R} ${SILL} L${firstX} ${SILL} Z`;
}

const wheel = (x, cls) =>
  `<g class="${cls}"><circle cx="${x}" cy="${WHEEL_Y}" r="${WHEEL_R}"/><circle cx="${x}" cy="${WHEEL_Y}" r="${WHEEL_R * 0.48}" class="hub"/></g>`;

/** Layered vehicle illustration. `id` must be unique on the page. */
export function vehicleArt(v, { id = v.id, interactive = true, label } = {}) {
  const p = PROFILES[v.art];
  const d = bodyPath(p);
  const [front, rear] = p.wheels;
  // Front motors sit at the old bellhousing, behind the front axle; rear motors ahead of the rear axle.
  const motorX = v.electric.motorAt === 'front' ? front + 90 : rear - 40;
  const motorY = 176;
  const boxes = v.electric.boxes
    .map(([x, y, w, h], i) => `<rect class="ev-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"><title>Battery box ${i + 1}</title></rect>`)
    .join('');
  const boxCenters = v.electric.boxes.map(([x, y, w, h]) => [x + w / 2, y + h / 2]);
  const cables = boxCenters
    .map(([x, y]) => `<path class="ev-cable" d="M${x} ${y} C${x} ${y + 30} ${motorX} ${motorY + 40} ${motorX} ${motorY + 14}"/>`)
    .join('');
  const wb = `<g class="bp-dim"><path d="M${front} ${GROUND + 14} L${rear} ${GROUND + 14} M${front} ${GROUND + 6} L${front} ${GROUND + 22} M${rear} ${GROUND + 6} L${rear} ${GROUND + 22}"/><text x="${(front + rear) / 2}" y="${GROUND + 32}" text-anchor="middle">WB ${v.wheelbaseMm} mm</text></g>`;
  const [b1] = v.electric.boxes;
  const callouts = `
    <g class="bp-callout"><path d="M${motorX} ${motorY - 18} L${motorX} 60 L${motorX + 24} 60"/><text x="${motorX + 28}" y="64">MOTOR MOUNT · ADAPTER</text></g>
    <g class="bp-callout"><path d="M${b1[0] + 10} ${b1[1]} L${b1[0] + 10} 40 L${b1[0] + 34} 40"/><text x="${b1[0] + 38}" y="44">BATTERY BOX</text></g>`;
  const title = label || `${v.name} side profile`;
  return `
<figure class="vehicle-art${interactive ? ' is-interactive' : ''}" data-view="classic" id="art-${esc(id)}">
  <svg viewBox="0 0 800 300" role="img" aria-labelledby="art-${esc(id)}-t">
    <title id="art-${esc(id)}-t">${esc(title)}: classic, blueprint and electric layers</title>
    <defs><pattern id="grid-${esc(id)}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="grid-line"/></pattern></defs>
    <rect class="layer-grid" x="0" y="0" width="800" height="300" fill="url(#grid-${esc(id)})"/>
    <line class="ground" x1="20" y1="${GROUND}" x2="780" y2="${GROUND}"/>
    <g class="layer layer-classic">
      <path class="body" d="${d}"/>
      ${p.glass.map((g) => `<path class="glass" d="${g}"/>`).join('')}
      ${p.lines.map((l) => `<path class="trim" d="${l}"/>`).join('')}
      ${wheel(front, 'wheel')}${wheel(rear, 'wheel')}
    </g>
    <g class="layer layer-blueprint">
      <path class="bp-body" d="${d}" pathLength="1"/>
      ${p.glass.map((g) => `<path class="bp-line" d="${g}"/>`).join('')}
      <circle class="bp-line" cx="${front}" cy="${WHEEL_Y}" r="${WHEEL_R}"/><circle class="bp-line" cx="${rear}" cy="${WHEEL_Y}" r="${WHEEL_R}"/>
      <rect class="bp-part" x="${motorX - 26}" y="${motorY - 18}" width="52" height="36" rx="3"/>
      ${v.electric.boxes.map(([x, y, w, h]) => `<rect class="bp-part" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`).join('')}
      ${callouts}${wb}
    </g>
    <g class="layer layer-electric">
      <path class="ev-ghost" d="${d}"/>
      ${wheel(front, 'ev-wheel')}${wheel(rear, 'ev-wheel')}
      ${cables}${boxes}
      <g class="ev-motor"><circle cx="${motorX}" cy="${motorY}" r="20"/><path d="M${motorX - 4} ${motorY - 10} l-6 12h8l-4 10 12-14h-8l4-8z"/></g>
      <path class="ev-shaft" d="M${motorX} ${motorY + 20} L${motorX} ${WHEEL_Y} M${motorX} ${WHEEL_Y} L${rear} ${WHEEL_Y}"/>
    </g>
  </svg>
  ${interactive ? `
  <figcaption class="view-toggle" role="group" aria-label="Illustration view">
    <button type="button" data-set-view="classic" aria-pressed="true">Classic</button>
    <button type="button" data-set-view="blueprint" aria-pressed="false">Blueprint</button>
    <button type="button" data-set-view="electric" aria-pressed="false">Electric</button>
  </figcaption>` : ''}
</figure>`;
}

/** Exploded-view illustration of a motor mount + adapter plate assembly. */
export function explodedView() {
  return `
<svg class="exploded" viewBox="0 0 640 360" role="img" aria-labelledby="exploded-t">
  <title id="exploded-t">Exploded view of a Fitment Pack motor mount, adapter plate and coupler</title>
  <g class="ex-axis"><path d="M40 300 L600 60"/></g>
  <g class="ex-part" style="--d:0">
    <path d="M70 250 l90 -38 v80 l-90 38 z"/><path d="M160 212 l30 12 v80 l-30 -12"/>
    <circle cx="115" cy="270" r="22"/><text x="60" y="340">MOTOR FACE</text>
  </g>
  <g class="ex-part accent" style="--d:1">
    <path d="M230 200 l110 -46 v110 l-110 46 z"/>
    <circle cx="285" cy="232" r="26"/>
    <circle cx="248" cy="212" r="4"/><circle cx="322" cy="182" r="4"/><circle cx="248" cy="282" r="4"/><circle cx="322" cy="252" r="4"/>
    <text x="226" y="330">ADAPTER PLATE · 6061-T6</text>
  </g>
  <g class="ex-part" style="--d:2">
    <path d="M378 164 l40 -16 v34 l-40 16 z"/><path d="M418 148 l14 6 v34 l-14 -6"/>
    <text x="370" y="232">COUPLER</text>
  </g>
  <g class="ex-part" style="--d:3">
    <path d="M470 120 l100 -42 v90 l-100 42 z"/><path d="M520 99 v90"/>
    <text x="468" y="214">BELLHOUSING</text>
  </g>
</svg>`;
}
