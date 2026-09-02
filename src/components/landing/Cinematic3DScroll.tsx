"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/WalletConnectButton";

// Scene definitions
export interface SceneItem {
  id: string;
  name: string;
  len: number;
  start: number;
  end: number;
}

const RAW_SCENES = [
  { id: "void", name: "THE VOID", len: 3.2 },
  { id: "world", name: "THE WORLD", len: 3.0 },
  { id: "npc", name: "THE NPC", len: 2.4 },
  { id: "mind", name: "COGNITION", len: 2.6 },
  { id: "memory", name: "MEMORY", len: 3.4 },
  { id: "recall", name: "RECALL", len: 3.0 },
  { id: "ask", name: "THE QUESTION", len: 3.0 },
  { id: "process", name: "PROCESSING", len: 3.0 },
  { id: "price", name: "THE PRICE", len: 3.0 },
  { id: "settle", name: "SETTLEMENT", len: 4.0 },
  { id: "transmute", name: "TRANSMUTATION", len: 2.4 },
  { id: "core", name: "THE CORE", len: 2.6 },
  { id: "answer", name: "THE ANSWER", len: 3.0 },
  { id: "others", name: "THE WORLD RESPONDS", len: 2.6 },
  { id: "universe", name: "THE NPC UNIVERSE", len: 3.2 },
  { id: "api", name: "THE INTERFACE", len: 3.0 },
  { id: "play", name: "PLAYGROUND", len: 3.4 },
  { id: "network", name: "THE NETWORK", len: 2.6 },
  { id: "final", name: "MAKE THEM ALIVE", len: 3.4 },
];

const TOTAL_LEN = RAW_SCENES.reduce((s, x) => s + x.len, 0);
let acc = 0;
const SCENES: SceneItem[] = RAW_SCENES.map((s) => {
  const start = acc / TOTAL_LEN;
  acc += s.len;
  const end = acc / TOTAL_LEN;
  return { ...s, start, end };
});


const MEM_NODES: [string, [number, number, number], number][] = [
  ["GARRICK", [0, 2, -70], 0],
  ["PLAYER MET", [4.6, 4.6, -63.5], 1],
  ["FAVOR", [7.2, 1.2, -67.5], 1],
  ["THREAT", [5, 0.1, -74.5], 1],
  ["QUEST", [-4.6, 4.3, -64.5], 1],
  ["LOCATION", [-7.4, 1.1, -69], 1],
  ["TRUST", [-5.6, 0.1, -75.5], 1],
  ["PREVIOUS DIALOGUE", [-1.8, 5.6, -73.5], 1],
  ["WORLD STATE", [1.6, 6.2, -76.5], 1],
];

const FIGS = [
  { id: "garrick", name: "GARRICK", trait: "SUSPICIOUS", trust: 47, mem: "1,208", pos: [0, 0, -262], sc: 0.98, note: "THE SUSPICIOUS BARTENDER" },
  { id: "lyra", name: "LYRA", trait: "CURIOUS", trust: 64, mem: "892", pos: [9, 0, -276], sc: 0.88, note: "STABLEHAND — REMEMBERS FACES" },
  { id: "vaelathor", name: "VAELATHOR", trait: "WARY", trust: 21, mem: "4,412", pos: [-9, 0, -284], sc: 1.34, note: "ELDER LOREKEEPER — SPEAKS IN RIDDLES" },
  { id: "mira", name: "MIRA", trait: "ARCHIVIST", trust: 88, mem: "12,004", pos: [14, 0, -296], sc: 0.92, note: "KEEPER OF THE LEDGER" },
  { id: "kae", name: "KAE", trait: "GUARDED", trust: 33, mem: "2,210", pos: [-15, 0, -308], sc: 1.05, note: "CROSSING GUARD — OWES A DEBT" },
  { id: "tanneth", name: "OLD TANNETH", trait: "FORGETFUL", trust: 61, mem: "96", pos: [6, 0, -322], sc: 1.1, note: "FISHERMAN — LOSES DAYS" },
];

const HUBS: [string, [number, number, number]][] = [
  ["NPCS", [-15, 7.5, -352]],
  ["AI", [0, 12.5, -380]],
  ["MEMORY", [15, 5.5, -356]],
  ["PAYMENTS", [10.5, 10.5, -384]],
  ["GAME ENGINE", [-12.5, -0.5, -382]],
  ["API", [0, -2.5, -367]],
];

const TX_STAGES = [
  'HTTP <span class="c">402</span> — PAYMENT REQUIRED',
  'PAYMENT REQUESTED — <span class="g">0.01 USDC</span>',
  'WALLET SIGNING — <span class="g">EIP-191</span>',
  'SIGNATURE <span class="c">VERIFIED</span>',
  'USDC SETTLEMENT — <span class="g">BASE SEPOLIA</span>',
  'BLOCKCHAIN <span class="c">CONFIRMED</span> — BLOCK #8,441,207',
  'AI RESPONSE <span class="g">UNLOCKED</span>',
];

function npcRespond(msg: string) {
  const m = (msg || "").toLowerCase();
  if (/threat|sword|kill|fight|blade/.test(m)) return "Put the sword away first.\nThen we talk — like civilized people.";
  if (/remember|met|before|again/.test(m)) return "You're the one who fixed my cellar door.\nI don't forget debts.";
  if (/what happened|here|this place|tavern/.test(m)) return "You really want to know?\n…Then put the sword away first.";
  if (/hello|hi |hey|greetings/.test(m)) return "You're new. I can smell it.\nWhat are you drinking?";
  if (/gold|money|pay|usdc|price/.test(m)) return "Everything costs something.\nEven answers. Especially answers.";
  return "Talk's cheap, friend.\nAsk me something that matters.";
}

export function Cinematic3DScroll() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastIdxRef = useRef(0);
  const [curSceneIdx, setCurSceneIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pgBusy, setPgBusy] = useState(false);
  const [pgCode, setPgCode] = useState(`{\n  "npc_id": "garrick_bartender",\n  "player_message": "What happened here?",\n  "memory_window": 12,\n  "temperature": 0.8\n}`);
  const [pgResp, setPgResp] = useState<{ who?: string; text: string; idle?: boolean }>({ idle: true, text: "// response stream — run the request" });
  const [pgStats, setPgStats] = useState({ pay: false, ai: false, lat: 0 });

  const QUICK_PROMPTS = [
    { label: "🗡️ Threaten", msg: "I have a blade, bartender. Give me answers." },
    { label: "🍺 Order Ale", msg: "Hey Garrick, pour me something strong." },
    { label: "📜 Tavern Lore", msg: "What happened here in this tavern?" },
    { label: "💰 x402 Price", msg: "How much does your knowledge cost in USDC?" }
  ];

  const applyPreset = (msg: string) => {
    try {
      const parsed = JSON.parse(pgCode);
      parsed.player_message = msg;
      setPgCode(JSON.stringify(parsed, null, 2));
    } catch {
      setPgCode(`{\n  "npc_id": "garrick_bartender",\n  "player_message": "${msg}",\n  "memory_window": 12,\n  "temperature": 0.8\n}`);
    }
  };

  const runPlayground = async () => {
    if (pgBusy) return;
    setPgBusy(true);
    setPgResp({ idle: true, text: "HTTP 402 — payment required · 0.01 USDC (demo)" });
    setPgStats({ pay: false, ai: false, lat: 0 });

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const t0 = performance.now();

    await sleep(450);
    setPgResp({ idle: true, text: "EIP-191 signature request → wallet signing…" });
    await sleep(550);
    setPgStats((s) => ({ ...s, pay: true }));
    setPgResp({ idle: true, text: "Payment verified on Base Sepolia — generating response…" });
    await sleep(400);

    let msg = "What happened here?";
    try {
      const parsed = JSON.parse(pgCode);
      msg = parsed.player_message || msg;
    } catch (e) { }

    const fullReply = npcRespond(msg);
    const latency = Math.round(performance.now() - t0 + 420 + Math.random() * 240);

    setPgResp({ who: "GARRICK — SUSPICIOUS BARTENDER · TRUST 47%", text: "" });

    for (let i = 0; i <= fullReply.length; i++) {
      setPgResp({ who: "GARRICK — SUSPICIOUS BARTENDER · TRUST 47%", text: fullReply.slice(0, i) });
      if (i % 2 === 0) await sleep(16);
    }

    setPgStats({ pay: true, ai: true, lat: latency });
    setPgBusy(false);
  };

  const scrollToScene = (index: number) => {
    setMobileMenuOpen(false);
    const totalH = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = SCENES[Math.max(0, Math.min(index, SCENES.length - 1))].start * totalH + 4;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  useEffect(() => {
    let animId: number;

    const loadThreeScript = () => {
      if ((window as any).THREE) {
        initEngine();
        return;
      }
      const s = document.createElement("script");
      s.src = "/vendor/three.min.js";
      s.async = true;
      s.onload = () => {
        initEngine();
      };
      document.body.appendChild(s);
    };

    const initEngine = () => {
      const THREE = (window as any).THREE;
      if (!THREE || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const TOUCH = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
      const SMALL = Math.min(screen.width, screen.height) < 760 || (TOUCH && Math.min(screen.width, screen.height) < 920);
      const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const Q = {
        nHero: SMALL ? 5200 : 15000,
        nEnv: SMALL ? 1400 : 3600,
        nDust: SMALL ? 900 : 2200,
        nFig: SMALL ? 320 : 760,
        nPulse: SMALL ? 260 : 460,
        dpr: SMALL ? Math.min(window.devicePixelRatio, 1.6) : Math.min(window.devicePixelRatio, 2),
        size: SMALL ? 1.75 : 2.25,
      };

      const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const sm = (t: number) => t * t * (3 - 2 * t);
      const ramp = (u: number, a: number, b: number) => clamp((u - a) / (b - a), 0, 1);
      function mulberry(seed: number) {
        return function () {
          seed |= 0;
          seed = (seed + 0x6d2b79f5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      function fillPts(N: number, fn: (i: number) => [number, number, number]) {
        const a = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          const p = fn(i);
          a[i * 3] = p[0];
          a[i * 3 + 1] = p[1];
          a[i * 3 + 2] = p[2];
        }
        return a;
      }
      function seg(edges: number[], x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
        edges.push(x1, y1, z1, x2, y2, z2);
      }
      function randDir(r: () => number) {
        const u = r() * 2 - 1,
          ph = r() * 6.2832,
          s = Math.sqrt(1 - u * u);
        return [s * Math.cos(ph), u, s * Math.sin(ph)];
      }

      function shapeSingleton(N: number) {
        return { pos: fillPts(N, () => [(Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05]), edges: null, center: [0, 0, 0] };
      }
      function shapeNeural(N: number) {
        const r = mulberry(101),
          nodes: [number, number, number][] = [];
        for (let i = 0; i < 86; i++) nodes.push([(r() - 0.5) * 19, 2 + (r() - 0.5) * 10, -16 + (r() - 0.5) * 40]);
        const pairs: [number, number][] = [],
          has: Record<string, number> = {};
        nodes.forEach((a, i) => {
          const d = nodes.map((b, j) => ({ j, d: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 })).sort((x, y) => x.d - y.d);
          for (let k = 1; k < 3; k++) {
            const j = d[k].j,
              key = i < j ? i + "_" + j : j + "_" + i;
            if (!has[key] && r() < 0.85) {
              has[key] = 1;
              pairs.push([i, j]);
            }
          }
        });
        const edges: number[] = [];
        pairs.forEach((p) => seg(edges, ...nodes[p[0]], ...nodes[p[1]]));
        const pos = fillPts(N, () => {
          const t = r();
          if (t < 0.45) {
            const e = pairs[(r() * pairs.length) | 0],
              k = r(),
              j = 0.35;
            return [lerp(nodes[e[0]][0], nodes[e[1]][0], k) + (r() - 0.5) * j, lerp(nodes[e[0]][1], nodes[e[1]][1], k) + (r() - 0.5) * j, lerp(nodes[e[0]][2], nodes[e[1]][2], k) + (r() - 0.5) * j];
          }
          if (t < 0.7) {
            const n = nodes[(r() * nodes.length) | 0];
            return [n[0] + (r() - 0.5) * 0.9, n[1] + (r() - 0.5) * 0.9, n[2] + (r() - 0.5) * 0.9];
          }
          return [(r() - 0.5) * 17, 2 + (r() - 0.5) * 9, -16 + (r() - 0.5) * 38];
        });
        return { pos, edges: new Float32Array(edges), center: [0, 2, -16] };
      }
      function shapeWorld(N: number) {
        const r = mulberry(202),
          bld: any[] = [];
        for (let z = -92; z < 24; z += 8.5 + r() * 3) {
          for (const side of [-1, 1]) {
            if (r() < 0.18) continue;
            bld.push({ x: side * (11.5 + r() * 17), z: z + (r() - 0.5) * 3, w: 3.5 + r() * 5.5, h: 5 + r() * 15 });
          }
        }
        const orbs: [number, number, number][] = [];
        for (let i = 0; i < 52; i++) orbs.push([(r() - 0.5) * 34, 2.5 + r() * 9, -90 + r() * 112]);
        const ground = (r2: () => number) => {
          let x = (r2() - 0.5) * 72;
          if (r2() < 0.55) x *= 0.42;
          return [x, -3.5 + (r2() - 0.5) * 0.25, -95 + r2() * 120] as [number, number, number];
        };
        const bpt = (r2: () => number) => {
          const b = bld[(r2() * bld.length) | 0];
          const f = r2();
          if (f < 0.62) return [b.x + (r2() - 0.5) * b.w, -3.5 + r2() * b.h, b.z + (r2() > 0.5 ? 1 : -1) * (0.12 + r2() * 0.1)] as [number, number, number];
          if (f < 0.81) return [b.x + (r2() > 0.5 ? 1 : -1) * (0.12 + r2() * 0.1), -3.5 + r2() * b.h, b.z + (r2() - 0.5) * 1.2] as [number, number, number];
          return [b.x + (r2() - 0.5) * b.w, -3.5 + b.h * (0.92 + r2() * 0.1), b.z + (r2() - 0.5) * 1.2] as [number, number, number];
        };
        const pos = fillPts(N, () => {
          const t = r();
          if (t < 0.34) return ground(r);
          if (t < 0.7) return bpt(r);
          if (t < 0.8) {
            const o = orbs[(r() * orbs.length) | 0];
            return [o[0] + (r() - 0.5) * 0.7, o[1] + (r() - 0.5) * 0.7, o[2] + (r() - 0.5) * 0.7];
          }
          if (t < 0.85) {
            const s = r() < 0.5 ? -1 : 1;
            return [s * (8 + (r() - 0.5) * 0.9), -3.5 + r() * 9.5, -40 + (r() - 0.5) * 0.8];
          }
          const d = randDir(r);
          const rr = 6 + r() * 8;
          return [d[0] * rr * (2.6 + r()), Math.max(-2.4, 1.8 + d[1] * rr * 0.35), -52 + d[2] * rr * 3.4];
        });
        const edges: number[] = [];
        for (let x = -30; x <= 30; x += 10) seg(edges, x, -3.5, 24, x, -3.5, -95);
        for (let z = -90; z <= 20; z += 14) {
          seg(edges, -34, -3.5, z, 34, -3.5, z);
        }
        bld.forEach((b, i) => {
          if (i % 2) return;
          seg(edges, b.x - b.w / 2, -3.5 + b.h, b.z, b.x - b.w / 2, -3.5, b.z);
          seg(edges, b.x + b.w / 2, -3.5, b.z, b.x + b.w / 2, -3.5 + b.h, b.z);
        });
        return { pos, edges: new Float32Array(edges), center: [0, 0, -35] };
      }

      function garrickCloud(count: number, seed: number) {
        const r = mulberry(seed);
        const defs: [number, () => [number, number, number]][] = [
          [
            0.3,
            () => {
              const u = r(),
                v = r(),
                th = u * 6.2832,
                ph = Math.acos(2 * v - 1);
              let x = Math.sin(ph) * Math.cos(th) * 0.235,
                y = Math.cos(ph) * 0.235,
                z = Math.sin(ph) * Math.sin(th) * 0.235;
              if (z < 0) z *= 0.5;
              return [x, 2.62 + y, z + 0.03 + (z > 0 ? 0.03 : 0)];
            },
          ],
          [
            0.26,
            () => {
              const a = r() * 6.2832,
                y = 1.02 + r() * 1.28,
                rad = lerp(0.32, 0.46, (y - 1.02) / 1.28);
              return [Math.cos(a) * rad * (0.92 + 0.16 * r()), y, Math.sin(a) * rad * 0.72 + 0.05 + (Math.sin(a) > 0 ? 0.05 : 0)];
            },
          ],
          [
            0.07,
            () => {
              const s = r() < 0.5 ? -1 : 1,
                u = r(),
                v = r(),
                th = u * 6.2832,
                ph = Math.acos(2 * v - 1);
              return [s * 0.55 + Math.sin(ph) * Math.cos(th) * 0.27, 2.16 + Math.cos(ph) * 0.24, Math.sin(ph) * Math.sin(th) * 0.24];
            },
          ],
          [
            0.12,
            () => {
              const s = r() < 0.5 ? -1 : 1,
                t = r();
              const A = [s * 0.63, 2.03, 0.06],
                B = [s * 0.72, 1.5, 0.16],
                C = [s * 0.5, 1.02, 0.3];
              const P = t < 0.5 ? [lerp(A[0], B[0], t * 2), lerp(A[1], B[1], t * 2), lerp(A[2], B[2], t * 2)] : [lerp(B[0], C[0], (t - 0.5) * 2), lerp(B[1], C[1], (t - 0.5) * 2), lerp(B[2], C[2], (t - 0.5) * 2)];
              return [P[0] + (r() - 0.5) * 0.16, P[1] + (r() - 0.5) * 0.16, P[2] + (r() - 0.5) * 0.16] as [number, number, number];
            },
          ],
          [
            0.04,
            () => {
              const s = r() < 0.5 ? -1 : 1;
              return [s * 0.47 + (r() - 0.5) * 0.14, 0.98 + (r() - 0.5) * 0.14, 0.34 + (r() - 0.5) * 0.14];
            },
          ],
          [
            0.15,
            () => {
              const s = r() < 0.5 ? -1 : 1,
                t = r();
              return [s * lerp(0.2, 0.25, t) + (r() - 0.5) * 0.22, lerp(1.0, 0.12, t), 0.04 + (r() - 0.5) * 0.22];
            },
          ],
          [
            0.06,
            () => {
              const a = r() * 6.2832,
                y = r();
              return [Math.cos(a) * lerp(0.5, 0.3, y), lerp(1.0, 2.2, y), Math.sin(a) * lerp(0.28, 0.1, y) + 0.12];
            },
          ],
        ];
        let tot = 0;
        defs.forEach((d) => (tot += d[0]));
        let acc2 = 0;
        const cum = defs.map((d) => (acc2 += d[0] / tot));
        const pick = () => {
          const t = r();
          for (let i = 0; i < cum.length; i++) if (t <= cum[i]) return defs[i][1]();
          return defs[defs.length - 1][1]();
        };
        return fillPts(count, () => {
          let p = pick();
          if (p[1] > 1.35) p[2] -= (p[1] - 1.35) * 0.15;
          p[0] += (r() - 0.5) * 0.045;
          p[1] += (r() - 0.5) * 0.045;
          p[2] += (r() - 0.5) * 0.045;
          return p;
        });
      }

      function shapeGarrick(N: number) {
        const local = garrickCloud(N, 7);
        for (let i = 0; i < N; i++) {
          local[i * 3 + 2] -= 70;
        }
        return { pos: local, edges: null, center: [0, 1.6, -70] };
      }
      function shapeMemory(N: number) {
        const r = mulberry(505),
          C = [0, 2, -70];
        const mains = MEM_NODES.slice(1).map((n) => n[1]);
        const minors: [number, number, number][] = [];
        for (let i = 0; i < 26; i++) {
          const d = randDir(r);
          const rr = 8 + r() * 3.5;
          minors.push([C[0] + d[0] * rr, C[1] + d[1] * rr * 0.7, C[2] + d[2] * rr]);
        }
        const pairs: [[number, number, number], [number, number, number]][] = [];
        mains.forEach((m, i) => {
          pairs.push([C as any, m]);
          if (i < mains.length - 1 && r() < 0.7) pairs.push([m, mains[i + 1]]);
        });
        pairs.push([mains[1], mains[2]]);
        pairs.push([mains[5], mains[6]]);
        const edges: number[] = [];
        pairs.forEach((p) => seg(edges, ...p[0], ...p[1]));
        const pos = fillPts(N, () => {
          const t = r();
          if (t < 0.42) {
            const e = pairs[(r() * pairs.length) | 0];
            const P = [lerp(e[0][0], e[1][0], r()), lerp(e[0][1], e[1][1], r()), lerp(e[0][2], e[1][2], r())];
            return [P[0] + (r() - 0.5) * 0.4, P[1] + (r() - 0.5) * 0.4, P[2] + (r() - 0.5) * 0.4] as [number, number, number];
          }
          if (t < 0.66) {
            const n = r() < 0.3 ? C : mains[(r() * mains.length) | 0];
            return [n[0] + (r() - 0.5) * 0.85, n[1] + (r() - 0.5) * 0.85, n[2] + (r() - 0.5) * 0.85] as [number, number, number];
          }
          const d = randDir(r),
            rr = Math.pow(r(), 0.6) * 13.5;
          return [C[0] + d[0] * rr, C[1] + d[1] * rr * 0.8, C[2] + d[2] * rr];
        });
        return { pos, edges: new Float32Array(edges), center: C };
      }

      function shapeChamber(N: number) {
        const r = mulberry(808),
          edges: number[] = [];
        const gates: [number, number, number][][] = [];
        for (let k = 0; k < 13; k++) {
          const z = -52 - k * 7.5,
            verts: [number, number, number][] = [];
          for (let v = 0; v < 6; v++) {
            const a = (v / 6) * 6.2832 + (k % 2) * 0.52;
            verts.push([Math.cos(a) * 5.3, 2 + Math.sin(a) * 5.3, z]);
          }
          gates.push(verts);
        }
        gates.forEach((g) => {
          for (let v = 0; v < 6; v++) seg(edges, ...g[v], ...g[(v + 1) % 6]);
        });
        const pos = fillPts(N, () => {
          const t = r();
          if (t < 0.5) {
            const g = gates[(r() * gates.length) | 0],
              v = (r() * 6) | 0;
            const A = g[v],
              B = g[(v + 1) % 6],
              k = r();
            return [lerp(A[0], B[0], k) + (r() - 0.5) * 0.3, lerp(A[1], B[1], k) + (r() - 0.5) * 0.3, A[2] + (r() - 0.5) * 0.3];
          }
          const d = randDir(r);
          return [d[0] * 11, 2 + d[1] * 7, -97 + d[2] * 46];
        });
        return { pos, edges: new Float32Array(edges), center: [0, 2, -97] };
      }

      function shapeTunnel(N: number) {
        const r = mulberry(909),
          edges: number[] = [];
        const z0 = -128,
          z1 = -238,
          R = 5.4;
        for (let z = z0; z > z1; z -= 12)
          for (let v = 0; v < 26; v++) {
            const a = (v / 26) * 6.2832;
            seg(edges, Math.cos(a) * 6.6, 2 + Math.sin(a) * 6.4, z, Math.cos(a) * 6.6, 2 + Math.sin(a) * 6.4, z - 0.05);
          }
        const pos = fillPts(N, () => {
          const z = z0 - r() * (z0 - z1);
          const a = r() * 6.2832;
          return [Math.cos(a) * R + (r() - 0.5) * 0.3, 2 + Math.sin(a) * R * 0.92 + (r() - 0.5) * 0.3, z];
        });
        return { pos, edges: new Float32Array(edges), center: [0, 2, -183] };
      }

      function shapeCore(N: number) {
        const r = mulberry(1212),
          C = [0, 2, -262],
          edges: number[] = [];
        for (let k = 0; k < 3; k++)
          for (let i = 0; i < 48; i++) {
            const a = (i / 48) * 6.2832,
              b = ((i + 1) / 48) * 6.2832;
            const tilt = k * 0.9;
            const p1 = [Math.cos(a) * 7 * Math.cos(tilt), Math.sin(a) * 7 * Math.cos(tilt), Math.sin(a) * 7 * Math.sin(tilt)];
            const p2 = [Math.cos(b) * 7 * Math.cos(tilt), Math.sin(b) * 7 * Math.cos(tilt), Math.sin(b) * 7 * Math.sin(tilt)];
            seg(edges, C[0] + p1[0], C[1] + p1[1], C[2] + p1[2], C[0] + p2[0], C[1] + p2[1], C[2] + p2[2]);
          }
        const pos = fillPts(N, (i) => {
          const y = 1 - 2 * ((i % 9973) / 9973);
          const rr = Math.sqrt(Math.max(0, 1 - y * y));
          const th = (i % 6131) * 0.7 + r() * 0.05;
          return [C[0] + Math.cos(th) * rr * 7, C[1] + y * 7, C[2] + Math.sin(th) * rr * 7];
        });
        return { pos, edges: new Float32Array(edges), center: C };
      }

      function shapeCode(N: number) {
        const r = mulberry(1616),
          edges: number[] = [],
          Z0 = -344,
          Z1 = -392;
        for (let rw = 0; rw < 34; rw += 3) {
          const y = 4 + (rw - 16.5) * 0.8,
            z = Z0 - ((Z1 - Z0) * rw) / 33;
          seg(edges, -8.5, y, z, 8.5, y, z);
        }
        const pos = fillPts(N, () => {
          const rw = (r() * 34) | 0;
          const y = 4 + (rw - 16.5) * 0.8 + (r() - 0.5) * 0.16;
          const xs = (r() - 0.5) * 17,
            len = 0.22 + r() * 1.15;
          const x = xs + r() * len;
          return [x, y, Z0 - ((Z1 - Z0) * rw) / 33 + (rw % 5) * 0.9];
        });
        return { pos, edges: new Float32Array(edges), center: [0, 4, -368] };
      }

      function shapeUniverse(N: number) {
        const r = mulberry(1818),
          C = [0, 4, -368];
        const hubs = HUBS.map((h) => h[1]);
        hubs.push(C as any);
        const edges: number[] = [];
        hubs.forEach((h, i) => {
          if (i < hubs.length - 1) seg(edges, ...h, ...hubs[i + 1]);
          seg(edges, ...h, ...(C as [number, number, number]));
        });
        const pos = fillPts(N, () => {
          const t = r();
          if (t < 0.62) {
            const h = hubs[(r() * hubs.length) | 0];
            return [h[0] + (r() - 0.5) * 2.6, h[1] + (r() - 0.5) * 2.6, h[2] + (r() - 0.5) * 2.6];
          }
          const d = randDir(r),
            rr = 14 + r() * 30;
          return [C[0] + d[0] * rr, C[1] + d[1] * rr * 0.75, C[2] + d[2] * rr];
        });
        return { pos, edges: new Float32Array(edges), center: C };
      }

      function shapeSilhouette(N: number) {
        const local = garrickCloud(N, 77);
        for (let i = 0; i < N; i++) {
          local[i * 3] *= 0.62;
          local[i * 3 + 1] = local[i * 3 + 1] * 0.62;
          local[i * 3 + 2] = local[i * 3 + 2] * 0.62 - 368;
        }
        return { pos: local, edges: null, center: [0, 1.2, -368] };
      }

      // Shaders
      const CLOUD_VERT = `
        attribute vec3 aPosB; attribute vec3 aRand; attribute float aRole;
        uniform float uMorph,uTime,uSize,uDrift,uSwirl,uConverge,uBoost,uTintC,uTintG,uRoleShift,uFlow,uFlowZ,uFlowSpan,uFogD,uFocus,uFocusR,uOpacity,uTwinkle,uMouseF,uMouse2F;
        uniform vec3 uMouse; uniform vec3 uMouse2; uniform vec3 uCenter;
        varying vec3 vCol; varying float vA;
        void main(){
          float mk=clamp((uMorph-aRand.x*0.38)/0.62,0.0,1.0); mk=mk*mk*(3.0-2.0*mk);
          vec3 p=mix(position,aPosB,mk);
          p-=uCenter;
          p+=vec3(sin(uTime*0.55+aRand.y*6.283),cos(uTime*0.42+aRand.z*6.283),sin(uTime*0.5+aRand.x*6.283))*uDrift*(0.5+0.5*aRand.y);
          float rr=length(p.xz);
          float ang=uSwirl*(1.0-clamp(rr/22.0,0.0,1.0));
          float ca=cos(ang),sa=sin(ang);
          p=vec3(p.x*ca-p.z*sa,p.y,p.x*sa+p.z*ca);
          p=mix(p,vec3(0.0),uConverge*(0.35+0.65*aRand.z));
          p+=uCenter;
          if(uFlow>0.0){ p.z=uFlowZ+mod(p.z-uFlowZ+uFlow*(0.4+0.6*aRand.y),uFlowSpan)-uFlowSpan*0.5; }
          vec3 d1=p-uMouse; float dl1=length(d1);
          float mf=uMouseF*exp(-dl1*dl1*0.18);
          p+=normalize(d1+vec3(1e-4))*mf;
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          float dep=max(-mv.z,0.1);
          float band=1.0-clamp(abs(dep-uFocus)/uFocusR,0.0,1.0);
          float tw=1.0;
          if(uTwinkle>0.0){ tw=0.82+0.22*sin(uTime*(2.0+2.0*aRole)+aRand.y*6.283); }
          vec3 cyan=vec3(0.25,0.88,1.0),gold=vec3(1.0,0.72,0.36),white=vec3(0.92,0.96,1.0);
          vec3 base=aRole<0.5?cyan:(aRole<1.5?gold:white);
          base=mix(base,cyan,uRoleShift*step(0.5,aRole)*step(aRole,1.5));
          base=mix(base,cyan,uTintC); base=mix(base,gold,uTintG);
          vCol=base*(0.5+0.5*band)*tw*(1.0+mf*3.0+uBoost);
          vA=(0.3+0.7*band)*exp(-pow(dep*uFogD,2.0));
          gl_PointSize=min(uSize*(0.55+0.9*aRand.y)*(1.0+mf*1.5)*(150.0/dep),44.0);
          gl_Position=projectionMatrix*mv;
        }
      `;
      const CLOUD_FRAG = `
        precision mediump float;
        varying vec3 vCol; varying float vA; uniform float uOpacity;
        void main(){
          vec2 q=gl_PointCoord-vec2(0.5);
          float d=length(q);
          float a=smoothstep(0.5,0.08,d)+smoothstep(0.14,0.0,d)*0.7;
          gl_FragColor=vec4(vCol,a*vA*uOpacity);
        }
      `;

      let renderer: any, scene: any, camera: any;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
        renderer.setPixelRatio(Q.dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x030509, 1);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 500);
      } catch (e) {
        console.error("WebGL init error", e);
        return;
      }

      function cloudUniforms(center: number[]) {
        return {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: Q.size },
          uDrift: { value: 0.1 },
          uSwirl: { value: 0 },
          uConverge: { value: 0 },
          uBoost: { value: 0 },
          uTintC: { value: 0 },
          uTintG: { value: 0 },
          uRoleShift: { value: 0 },
          uFlow: { value: 0 },
          uFlowZ: { value: 0 },
          uFlowSpan: { value: 1 },
          uFogD: { value: 0.02 },
          uFocus: { value: 14 },
          uFocusR: { value: 16 },
          uOpacity: { value: 1 },
          uTwinkle: { value: REDUCED ? 0 : 1 },
          uMouse: { value: new THREE.Vector3(0, 0, 0) },
          uMouseF: { value: TOUCH ? 0 : 0.5 },
          uMouse2: { value: new THREE.Vector3(999, 999, 999) },
          uMouse2F: { value: 0 },
          uCenter: { value: new THREE.Vector3(center[0], center[1], center[2]) },
        };
      }

      function makeCloudMat(center: number[]) {
        return new THREE.ShaderMaterial({
          uniforms: cloudUniforms(center),
          vertexShader: CLOUD_VERT,
          fragmentShader: CLOUD_FRAG,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        });
      }

      function cloudGeometry(N: number, shape: any) {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(shape.pos.slice(), 3));
        g.setAttribute("aPosB", new THREE.BufferAttribute(shape.pos.slice(), 3));
        const rand = new Float32Array(N * 3),
          role = new Float32Array(N);
        const r = mulberry(42);
        for (let i = 0; i < N; i++) {
          rand[i * 3] = r();
          rand[i * 3 + 1] = r();
          rand[i * 3 + 2] = r();
          const t = r();
          role[i] = t < 0.13 ? 0 : t < 0.21 ? 1 : 2;
        }
        g.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
        g.setAttribute("aRole", new THREE.BufferAttribute(role, 1));
        return g;
      }

      const SHAPES: Record<string, any> = {
        singleton: shapeSingleton(Q.nHero),
        neural: shapeNeural(Q.nHero),
        world: shapeWorld(Q.nHero),
        garrick: shapeGarrick(Q.nHero),
        memory: shapeMemory(Q.nHero),
        chamber: shapeChamber(Q.nHero),
        tunnel: shapeTunnel(Q.nHero),
        core: shapeCore(Q.nHero),
        code: shapeCode(Q.nHero),
        universe: shapeUniverse(Q.nHero),
        silhouette: shapeSilhouette(Q.nHero),
        garrick2: (() => {
          const l = garrickCloud(Q.nHero, 7);
          for (let i = 0; i < Q.nHero; i++) l[i * 3 + 2] -= 262;
          return { pos: l, edges: null, center: [0, 1.6, -262] };
        })(),
      };

      const heroGeo = cloudGeometry(Q.nHero, SHAPES.singleton);
      const heroMat = makeCloudMat([0, 0, 0]);
      const hero = new THREE.Points(heroGeo, heroMat);
      hero.frustumCulled = false;
      scene.add(hero);

      // Dust
      const r = mulberry(777),
        N = Q.nDust,
        dpos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        dpos[i * 3] = (r() - 0.5) * 74;
        dpos[i * 3 + 1] = (r() - 0.5) * 26;
        dpos[i * 3 + 2] = 30 - r() * 440;
      }
      const dustMat = makeCloudMat([0, 0, -190]);
      dustMat.uniforms.uSize.value = Q.size * 0.55;
      const dustPts = new THREE.Points(cloudGeometry(N, { pos: dpos }), dustMat);
      dustPts.frustumCulled = false;
      scene.add(dustPts);

      // Camera choreography
      const CAM: Record<string, number[][]> = {
        void: [[0, 0, 0, 26, 0, 0, 0, 55], [0.3, 0, 0, 18, 0, 0, 0, 55], [0.55, 0, 0, 10, 0, 1, -6, 62], [0.8, 0, 0.5, 0, 0, 2, -14, 66], [1, 0, 1, -12, 0, 2, -22, 66]],
        world: [[0, 0, 1, -12, 0, 2, -22, 66], [0.35, 1.5, 1.5, -30, 0, 2, -55, 62], [0.65, -1, 2, -44, 0, 2.4, -66, 58], [1, 0.5, 1.8, -56, 0, 2.2, -70, 50]],
        npc: [[0, 0.5, 1.8, -56, 0, 2.2, -70, 50], [0.5, 0.2, 2, -62.5, 0, 2.3, -70, 46], [1, 0, 2.05, -66.5, 0, 2.45, -70, 42]],
        mind: [[0, 0, 2.05, -66.5, 0, 2.2, -70, 44], [0.5, 4.7, 2.4, -68.3, 0, 2.2, -70, 46], [1, 3.54, 2.6, -74.2, 0, 2.2, -70, 46]],
        memory: [[0, 3.54, 2.6, -74.2, 0, 2.2, -70, 46], [0.4, 0, 5, -56, 0, 2, -70, 55], [0.75, 2.5, 3.5, -63, 0, 2.5, -70, 58], [1, 1.5, 2.5, -59, -1, 2.5, -66, 60]],
        recall: [[0, 1.5, 2.5, -59, -1, 2.5, -66, 60], [0.3, -2.5, 2, -66, -4.5, 1.5, -73, 52], [0.5, -3.8, 1.8, -69.5, -5.5, 1.2, -75, 44], [1, 0, 2.2, -60, 1, 2.2, -72, 58]],
        ask: [[0, 0, 2.2, -60, 1, 2.2, -72, 58], [0.3, 0, 2, -56, 0, 2, -70, 55], [1, 0, 2.4, -60, 0, 2.4, -98, 64]],
        process: [[0, 0, 2.4, -60, 0, 2.4, -98, 64], [0.5, 0, 2, -88, 0, 2, -125, 62], [1, 0, 2, -118, 0, 2, -152, 62]],
        price: [[0, 0, 2, -118, 0, 2, -152, 62], [0.5, 0, 2, -140, 0, 2, -175, 66], [1, 0, 2, -186, 0, 2, -214, 68]],
        settle: [[0, 0, 2, -186, 0, 2, -214, 68], [0.5, 0, 2, -204, 0, 2, -228, 66], [1, 0, 2, -222, 0, 2, -244, 62]],
        transmute: [[0, 0, 2, -222, 0, 2, -244, 62], [0.5, 0, 2, -238, 0, 2, -258, 58], [1, 0, 2.2, -246, 0, 2, -262, 54]],
        core: [[0, 0, 2.2, -246, 0, 2, -262, 54], [0.5, 8, 5, -252, 0, 2, -262, 50], [1, 9.5, 6, -268, 0, 2, -262, 48]],
        answer: [[0, 9.5, 6, -268, 0, 2, -262, 48], [0.5, 4, 3.4, -252, 0, 2.4, -262, 46], [1, 0, 2.5, -247.5, 0, 2.5, -262, 42]],
        others: [[0, 0, 2.5, -247.5, 0, 2.5, -262, 42], [0.5, 4, 3, -252, 4, 2.8, -276, 48], [1, 8, 3.2, -256, 6, 2.8, -290, 52]],
        universe: [[0, 8, 3.2, -256, 6, 2.8, -290, 52], [0.5, -12, 3.4, -282, -9, 3.4, -284, 48], [1, 6, 4.4, -318, 0, 4, -345, 56]],
        api: [[0, 6, 4.4, -318, 0, 4, -345, 56], [0.5, 2, 5, -334, 0, 4, -362, 56], [1, 0, 4.4, -352, 0, 4, -372, 48]],
        play: [[0, 0, 4.4, -352, 0, 4, -372, 48], [0.5, 0.6, 4.5, -353.5, 0, 4, -372, 48], [1, 0, 4.4, -355, 0, 4, -372, 47]],
        network: [[0, 0, 4.4, -355, 0, 4, -372, 47], [0.5, 0, 8, -322, 0, 4, -368, 58], [1, 0, 14, -300, 0, 4, -368, 74]],
        final: [[0, 0, 14, -300, 0, 4, -368, 74], [0.5, 0, 9, -320, 0, 3, -368, 66], [1, 0, 3.2, -354, 0, 2.6, -368, 46]],
      };

      const camState = { pos: [0, 0, 26], look: [0, 0, 0], fov: 55 };
      function camAt(id: string, u: number) {
        const k = CAM[id];
        if (!k) return;
        let a = k[0],
          b = k[k.length - 1];
        for (let i = 0; i < k.length - 1; i++) {
          if (u >= k[i][0] && u <= k[i + 1][0]) {
            a = k[i];
            b = k[i + 1];
            break;
          }
        }
        const t = b[0] === a[0] ? 0 : sm(clamp((u - a[0]) / (b[0] - a[0]), 0, 1));
        for (let c = 0; c < 3; c++) {
          camState.pos[c] = lerp(a[c + 1], b[c + 1], t);
          camState.look[c] = lerp(a[c + 4], b[c + 4], t);
        }
        camState.fov = lerp(a[7], b[7], t);
      }

      let curPair = "";
      function setHeroPair(a: string, b: string) {
        const key = a + "|" + b;
        if (key === curPair) return;
        curPair = key;
        heroGeo.attributes.position.array.set(SHAPES[a].pos);
        heroGeo.attributes.position.needsUpdate = true;
        heroGeo.attributes.aPosB.array.set(SHAPES[b].pos);
        heroGeo.attributes.aPosB.needsUpdate = true;
      }

      function pairFor(i: number, u: number): [string, string, number] {
        switch (SCENES[i].id) {
          case "void":
            return u < 0.22 ? ["singleton", "singleton", 0] : u < 0.62 ? ["singleton", "neural", ramp(u, 0.22, 0.62)] : ["neural", "neural", 0];
          case "world":
            return ["neural", "world", ramp(u, 0.06, 0.72)];
          case "npc":
            return ["world", "garrick", ramp(u, 0.02, 0.5)];
          case "mind":
            return ["garrick", "garrick", 0];
          case "memory":
            return ["garrick", "memory", ramp(u, 0.08, 0.7)];
          case "recall":
          case "ask":
            return ["memory", "memory", 0];
          case "process":
            return ["memory", "chamber", ramp(u, 0.04, 0.6)];
          case "price":
            return ["chamber", "tunnel", ramp(u, 0.02, 0.5)];
          case "settle":
            return ["tunnel", "tunnel", 0];
          case "transmute":
            return ["tunnel", "core", ramp(u, 0.05, 0.75)];
          case "core":
            return ["core", "core", 0];
          case "answer":
            return ["core", "garrick2", ramp(u, 0.12, 0.62)];
          case "others":
          case "universe":
            return ["garrick2", "garrick2", 0];
          case "api":
            return ["garrick2", "code", ramp(u, 0.1, 0.7)];
          case "play":
            return ["code", "code", 0];
          case "network":
            return ["code", "universe", ramp(u, 0.05, 0.6)];
          case "final":
            return u < 0.12 ? ["universe", "universe", 0] : ["universe", "silhouette", ramp(u, 0.12, 0.6)];
          default:
            return ["singleton", "singleton", 0];
        }
      }

      let p = 0,
        targetP = 0;
      let mx = 0,
        my = 0,
        mxS = 0,
        myS = 0;

      const handleScroll = () => {
        const maxS = document.documentElement.scrollHeight - window.innerHeight;
        targetP = maxS > 0 ? clamp(window.scrollY / maxS, 0, 1) : 0;
        setScrollProgress(targetP);
      };

      const handleMouseMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = -((e.clientY / window.innerHeight) * 2 - 1);
      };

      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("resize", handleResize, { passive: true });

      function sceneAt(prog: number) {
        prog = clamp(prog, 0, 1);
        for (let i = SCENES.length - 1; i >= 0; i--) {
          if (prog >= (SCENES[i] as any).start) {
            return { i, u: (prog - (SCENES[i] as any).start) / ((SCENES[i] as any).end - (SCENES[i] as any).start) };
          }
        }
        return { i: 0, u: 0 };
      }

      let lastT = performance.now() / 1000;

      const renderLoop = () => {
        animId = requestAnimationFrame(renderLoop);
        const now = performance.now() / 1000;
        const dt = Math.min(now - lastT, 0.05);
        lastT = now;

        p += (targetP - p) * (REDUCED ? 1 : 1 - Math.exp(-dt * 3.4));
        const sc = sceneAt(p);
        
        if (sc.i !== lastIdxRef.current) {
          lastIdxRef.current = sc.i;
          setCurSceneIdx(sc.i);
        }

        const id = SCENES[sc.i].id;
        camAt(id, sc.u);

        mxS += (mx - mxS) * 0.06;
        myS += (my - myS) * 0.06;

        camera.position.set(camState.pos[0] + mxS * 0.5, camState.pos[1] + myS * 0.35, camState.pos[2]);
        camera.fov = camState.fov;
        camera.updateProjectionMatrix();
        camera.lookAt(camState.look[0] + mxS * 0.9, camState.look[1] + myS * 0.6, camState.look[2]);

        const [shapeA, shapeB, morphK] = pairFor(sc.i, sc.u);
        setHeroPair(shapeA, shapeB);
        heroMat.uniforms.uMorph.value = morphK;
        heroMat.uniforms.uTime.value = now;
        dustMat.uniforms.uTime.value = now * 0.6;

        renderer.render(scene, camera);
      };

      renderLoop();

      cleanupEngine = () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        if (animId) cancelAnimationFrame(animId);
      };
    };

    let cleanupEngine: (() => void) | null = null;
    loadThreeScript();

    return () => {
      if (cleanupEngine) cleanupEngine();
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const isLetterboxed = curSceneIdx === 2 || curSceneIdx === 12;

  return (
    <div className="cinematic-container" ref={containerRef} style={{ height: `${TOTAL_LEN * 100}vh`, position: "relative" }}>
      {/* 3D WebGL Canvas */}
      <canvas id="gl" ref={canvasRef} />

      {/* Cinematic FX Overlays */}
      <div id="fx">
        <div id="vignette" />
        <div id="chroma" />
        <div id="grain" />
        <div id="lb-top" style={{ height: isLetterboxed ? "5.5vh" : "0", transition: "height 0.8s ease" }} />
        <div id="lb-bot" style={{ height: isLetterboxed ? "5.5vh" : "0", transition: "height 0.8s ease" }} />
      </div>

      {/* Floating HUD Header */}
      <header id="topbar">
        <div className="wordmark" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <i />
          NPC-402
          <span>DIALOGUE INFRA</span>
        </div>

        <nav id="topnav">
          <a onClick={() => scrollToScene(0)}>STORY</a>
          <a onClick={() => scrollToScene(4)}>MEMORY</a>
          <a onClick={() => scrollToScene(8)}>PROTOCOL</a>
          <a onClick={() => scrollToScene(14)}>UNIVERSE</a>
          <a onClick={() => scrollToScene(16)}>PLAYGROUND</a>
          <Link href="/dashboard" className="hot">DASHBOARD</Link>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-cyan-400 p-2 font-mono text-xs border border-cyan-400/40 bg-black/60 rounded"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕ CLOSE" : "☰ MENU"}
          </button>
          <WalletConnectButton />
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: "fixed",
            top: 70,
            left: 16,
            right: 16,
            background: "rgba(6, 9, 14, 0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(63, 224, 255, 0.3)",
            padding: 20,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
          }}
        >
          <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase border-b border-slate-800 pb-2">
            Navigation Jump
          </div>
          <button className="text-left font-mono text-xs text-white hover:text-cyan-400 py-1" onClick={() => scrollToScene(0)}>01 — STORY</button>
          <button className="text-left font-mono text-xs text-white hover:text-cyan-400 py-1" onClick={() => scrollToScene(4)}>05 — MEMORY</button>
          <button className="text-left font-mono text-xs text-white hover:text-cyan-400 py-1" onClick={() => scrollToScene(8)}>09 — PROTOCOL</button>
          <button className="text-left font-mono text-xs text-white hover:text-cyan-400 py-1" onClick={() => scrollToScene(14)}>15 — UNIVERSE</button>
          <button className="text-left font-mono text-xs text-white hover:text-cyan-400 py-1" onClick={() => scrollToScene(16)}>17 — PLAYGROUND</button>
          <Link href="/dashboard" className="font-mono text-xs text-amber-400 font-bold border-t border-slate-800 pt-3 flex items-center justify-between">
            <span>CONSOLE DASHBOARD</span>
            <span>▸</span>
          </Link>
        </div>
      )}

      {/* Chapter Rail */}
      <nav id="rail">
        {SCENES.map((s, i) => (
          <div key={s.id} className={`dot ${curSceneIdx === i ? "on" : ""}`} onClick={() => scrollToScene(i)}>
            <span className="tip">
              {String(i + 1).padStart(2, "0")} — {s.name}
            </span>
          </div>
        ))}
      </nav>

      {/* Bottom Status Bar */}
      <div id="bottombar">
        <div>
          <div id="scene-tag">
            <span className="idx">{String(curSceneIdx + 1).padStart(2, "0")}</span> / <b>{SCENES[curSceneIdx]?.name}</b>
          </div>
          <div id="progline">
            <i style={{ width: `${(scrollProgress * 100).toFixed(2)}%` }} />
          </div>
        </div>
        <div id="hint" style={{ opacity: scrollProgress > 0.005 ? 0 : 1 }}>
          <span>SCROLL TO EXPLORE</span>
          <div className="wheel" />
        </div>
        <div id="demo-flag" style={{ opacity: [8, 9, 10].includes(curSceneIdx) ? 1 : 0 }}>
          DEMO TRANSACTION — SIMULATED ON BASE SEPOLIA
        </div>
      </div>

      {/* Dynamic Chapter DOM Overlays */}
      <div id="chapters">
        {/* Scene 01: The Void */}
        <div className={`chapter ${curSceneIdx === 0 ? "live" : ""}`} style={{ opacity: curSceneIdx === 0 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="kicker">
            <span className="c">NPC-402</span> // DIALOGUE INFRASTRUCTURE
          </div>
          <div className="display">
            NPC-402
          </div>
          <div className="mono-line c" style={{ marginTop: 24 }}>
            WHAT IF NPCS COULD THINK?
          </div>
        </div>

        {/* Scene 02: The World */}
        <div className={`chapter ${curSceneIdx === 1 ? "live" : ""}`} style={{ opacity: curSceneIdx === 1 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="headline">
            MEET <span className="gd">GARRICK</span>.
          </div>
          <div className="headline" style={{ marginTop: 16 }}>
            HE <span className="cy">REMEMBERS</span>.
          </div>
        </div>

        {/* Scene 03: NPC Reveal */}
        <div className={`chapter lower ${curSceneIdx === 2 ? "live" : ""}`} style={{ opacity: curSceneIdx === 2 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="nameplate" style={{ opacity: 1, position: "relative", bottom: 0 }}>
            <div className="role">THE SUSPICIOUS BARTENDER</div>
            <div className="display" style={{ fontSize: "clamp(3.2rem, 8vw, 6.4rem)" }}>
              GARRICK
            </div>
            <div className="meta">
              <span>NPC_ID <b>garrick_bartender</b></span>
              <span>STATE <b>IDLE</b></span>
              <span>TRUST <b>47%</b></span>
              <span>MOOD <b>GUARDED</b></span>
            </div>
          </div>
        </div>

        {/* Scene 04: Cognition */}
        <div className={`chapter ${curSceneIdx === 3 ? "live" : ""}`} style={{ opacity: curSceneIdx === 3 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="headline">
            EVERY CONVERSATION<br />
            <span className="cy">CHANGES HIM</span>.
          </div>
        </div>

        {/* Scene 05: Memory Graph */}
        <div className={`chapter ${curSceneIdx === 4 ? "live" : ""}`} style={{ opacity: curSceneIdx === 4 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="mono-line c">
            HE IS MADE OF EVERYTHING YOU TOLD HIM
          </div>
        </div>

        {/* Scene 06: Memory Cards */}
        <div className={`chapter ${curSceneIdx === 5 ? "live" : ""}`} style={{ opacity: curSceneIdx === 5 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="mem-card" style={{ opacity: 1, position: "relative", inset: "auto", margin: "0 auto" }}>
            <div className="mk">
              <span>MEMORY <span className="id">#0413</span></span>
              <span>TRUST LEDGER</span>
            </div>
            <h3>PLAYER HELPED GARRICK</h3>
            <div className="delta up">TRUST +12</div>
            <div className="meter">
              <i style={{ width: "62%" }} />
            </div>
            <div className="foot">WITNESS: LYRA — CONFIDENCE 0.97</div>
          </div>
        </div>

        {/* Scene 07: Player Question */}
        <div className={`chapter ${curSceneIdx === 6 ? "live" : ""}`} style={{ opacity: curSceneIdx === 6 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="dlg">
            <div className="who player">PLAYER</div>
            <div className="line">&ldquo;What happened here?&rdquo;</div>
          </div>
          <div className="mono-line c" style={{ marginTop: 24 }}>
            THE QUESTION ENTERS THE NETWORK
          </div>
        </div>

        {/* Scene 08: Processing State */}
        <div className={`chapter ${curSceneIdx === 7 ? "live" : ""}`} style={{ opacity: curSceneIdx === 7 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="proc-state" style={{ opacity: 1, position: "relative", inset: "auto" }}>
            <div className="step">PIPELINE EXECUTION</div>
            <h2>RETRIEVING MEMORY & WORLD STATE</h2>
            <div className="sub">1,208 MEMORIES — TAVERN AT NIGHT — TENSION 0.61</div>
          </div>
        </div>

        {/* Scene 09: HTTP 402 */}
        <div className={`chapter ${curSceneIdx === 8 ? "live" : ""}`} style={{ opacity: curSceneIdx === 8 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="pay-panel" style={{ opacity: 1, position: "relative", inset: "auto", margin: "0 auto" }}>
            <div className="code">
              HTTP 402 <small>PAYMENT REQUIRED</small>
            </div>
            <div className="rows">
              <div className="amt"><span>AMOUNT</span><b>0.01 USDC</b></div>
              <div><span>NETWORK</span><b>BASE SEPOLIA</b></div>
              <div><span>SCHEME</span><b>EIP-191 SIGNED MESSAGE</b></div>
              <div><span>RECIPIENT</span><b>npc-402://garrick</b></div>
            </div>
            <div className="status">AWAITING PAYMENT</div>
          </div>
        </div>

        {/* Scene 10: Settlement */}
        <div className={`chapter ${curSceneIdx === 9 ? "live" : ""}`} style={{ opacity: curSceneIdx === 9 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="tx-stage" style={{ opacity: 1, position: "relative", inset: "auto", margin: "0 auto" }}>
            <div className="now" dangerouslySetInnerHTML={{ __html: TX_STAGES[4] }} />
            <div className="track">
              <i style={{ width: "70%" }} />
            </div>
            <div className="dots">
              {['402', 'REQ', 'SIGN', 'VERIFY', 'SETTLE', 'CONFIRM', 'UNLOCK'].map((d, i) => (
                <span key={d} className={i <= 4 ? "on" : ""}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scene 11: Transmutation */}
        <div className={`chapter ${curSceneIdx === 10 ? "live" : ""}`} style={{ opacity: curSceneIdx === 10 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="headline">
            <span className="gd">VALUE</span> BECOMES <span className="cy">INTELLIGENCE</span>.
          </div>
          <div className="mono-line" style={{ marginTop: 18 }}>
            USDC SETTLED — INFERENCE UNLOCKED
          </div>
        </div>

        {/* Scene 12: The Core */}
        <div className={`chapter ${curSceneIdx === 11 ? "live" : ""}`} style={{ opacity: curSceneIdx === 11 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="mono-line c">
            ONE MIND — EVERY WORD IT HAS EVER HEARD
          </div>
        </div>

        {/* Scene 13: NPC Response */}
        <div className={`chapter lower ${curSceneIdx === 12 ? "live" : ""}`} style={{ opacity: curSceneIdx === 12 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="dlg">
            <div className="who npc">GARRICK</div>
            <div className="line">&ldquo;You really want to know? …Then put the sword away first.&rdquo;</div>
          </div>
        </div>

        {/* Scene 14: The World Responds */}
        <div className={`chapter ${curSceneIdx === 13 ? "live" : ""}`} style={{ opacity: curSceneIdx === 13 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="headline">
            NO TWO CHARACTERS<br />
            ARE THE <span className="cy">SAME</span>.
          </div>
        </div>

        {/* Scene 15: NPC Universe */}
        <div className={`chapter ${curSceneIdx === 14 ? "live" : ""}`} style={{ opacity: curSceneIdx === 14 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, maxWidth: 900, width: "100%", margin: "0 auto" }}>
            {FIGS.slice(0, 3).map((f) => (
              <div key={f.id} className="npc-card" style={{ opacity: 1, position: "relative", inset: "auto", transform: "none" }}>
                <h4>{f.name}</h4>
                <div className="trait">{f.trait}</div>
                <div className="rows">
                  <div>TRUST <b>{f.trust}%</b></div>
                  <div>MEMORIES <b>{f.mem}</b></div>
                </div>
                <div className="bar"><i style={{ width: `${f.trust}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Scene 16: The Interface / API */}
        <div className={`chapter ${curSceneIdx === 15 ? "live" : ""}`} style={{ opacity: curSceneIdx === 15 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="codepanel" style={{ opacity: 1, position: "relative", inset: "auto", margin: "0 auto" }}>
            <div className="cdot"><i /><i /><i /></div>
            <div><span className="k">POST</span> <span className="p">/api/generate-dialogue</span></div>
            <div>&nbsp;</div>
            <div>&#123;</div>
            <div>&nbsp;&nbsp;<span className="a">&quot;npc_id&quot;</span><span className="p">:</span> <span className="s">&quot;garrick_bartender&quot;</span><span className="p">,</span></div>
            <div>&nbsp;&nbsp;<span className="a">&quot;player_message&quot;</span><span className="p">:</span> <span className="s">&quot;What happened here?&quot;</span><span className="p">,</span></div>
            <div>&nbsp;&nbsp;<span className="a">&quot;x402&quot;</span><span className="p">:</span> <span className="s">&quot;0.01 USDC — Base Sepolia&quot;</span></div>
            <div>&#125;</div>
            <div className="m" style={{ marginTop: 12 }}>— the request travels forward —</div>
          </div>
        </div>

        {/* Scene 17: Interactive Playground */}
        <div className={`chapter live ${curSceneIdx === 16 ? "live" : ""}`} style={{ opacity: curSceneIdx === 16 ? 1 : 0, pointerEvents: curSceneIdx === 16 ? "auto" : "none", transition: "opacity 0.6s ease" }}>
          <div className="pg-inner" style={{ margin: "0 auto" }}>
            <div className="pg-head">
              <div className="t"><b>API PLAYGROUND</b> — generate-dialogue v1</div>
              <div className="env">x402 · BASE SEPOLIA · DEMO</div>
            </div>

            {/* Quick Test Prompt Chips */}
            <div style={{ display: "flex", gap: 8, padding: "10px 20px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid var(--line)", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--mut)", letterSpacing: "0.2em", marginRight: 6 }}>TEST PRESETS:</span>
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p.msg)}
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--mono)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--white)",
                    padding: "4px 10px",
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--cyan)";
                    e.currentTarget.style.color = "var(--cyan)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = "var(--white)";
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="pg-body">
              <div className="pg-col">
                <div className="pg-lab"><span>REQUEST</span><span className="c">application/json</span></div>
                <div className="pg-method"><span className="mth">POST</span><span className="pth">/api/generate-dialogue</span></div>
                <textarea
                  id="pg-code"
                  spellCheck={false}
                  value={pgCode}
                  onChange={(e) => setPgCode(e.target.value)}
                />
                <div className="pg-run">
                  <button id="pg-runbtn" onClick={runPlayground} disabled={pgBusy}>
                    {pgBusy ? "PROCESSING ▸" : "RUN REQUEST ▸"}
                  </button>
                  <span className="cost">COST 0.01 USDC · PAY-PER-RESPONSE</span>
                </div>
              </div>
              <div className="pg-col">
                <div className="pg-lab"><span>NPC RESPONSE</span><span>LATENCY {pgStats.lat ? `${pgStats.lat} MS` : "—"}</span></div>
                <div id="pg-resp">
                  {pgResp.who && <span className="who">{pgResp.who}</span>}
                  {pgResp.idle ? <span className="idle">{pgResp.text}</span> : <span>{pgResp.text}</span>}
                  {pgBusy && <span className="caret" />}
                </div>
              </div>
            </div>
            <div className="pg-foot">
              <div className={`pg-stat gold ${pgStats.pay ? "ok" : ""}`}><span className="led" />PAYMENT VERIFIED</div>
              <div className={`pg-stat ${pgStats.ai ? "ok" : ""}`}><span className="led" />AI RESPONSE READY</div>
              <div className={`pg-stat ${pgStats.lat ? "ok" : ""}`}><span className="led" />LATENCY {pgStats.lat ? `${pgStats.lat} MS` : "—"}</div>
            </div>
          </div>
        </div>

        {/* Scene 18: The Network */}
        <div className={`chapter ${curSceneIdx === 17 ? "live" : ""}`} style={{ opacity: curSceneIdx === 17 ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div className="headline">
            EVERYTHING IS <span className="cy">CONNECTED</span>.
          </div>
        </div>

        {/* Scene 19: Final Call to Action */}
        <div className={`chapter live ${curSceneIdx === 18 ? "live" : ""}`} style={{ opacity: curSceneIdx === 18 ? 1 : 0, pointerEvents: curSceneIdx === 18 ? "auto" : "none", transition: "opacity 0.6s ease" }}>
          <div className="headline" style={{ marginBottom: 12 }}>
            MAKE THEM <span className="cy">ALIVE</span>.
          </div>
          <div className="cta-wrap" style={{ marginTop: 24 }}>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/dashboard" className="btn primary">
                LAUNCH NPC-402
              </Link>
              <button className="btn ghost" onClick={() => scrollToScene(16)}>
                OPEN PLAYGROUND
              </button>
            </div>
            <div className="footer-meta" style={{ marginTop: 32 }}>
              NPC-402 — x402 DIALOGUE PROTOCOL FOR GAME WORLDS<br />
              BUILT WITH REAL-TIME AI INFERENCE & CRYPTOGRAPHIC SETTLEMENT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
