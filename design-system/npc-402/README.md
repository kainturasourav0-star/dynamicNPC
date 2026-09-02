# NPC-402 — Cinematic 3D Scroll Experience

One continuous scroll-driven cinematic shot through the lifecycle of an AI NPC:
**CHARACTER → MEMORY → PLAYER INPUT → CONTEXT → PAYMENT → AI → RESPONSE → LIVING WORLD → DEVELOPER PLATFORM → NPC-402**

## Run it
`index.html` is fully self-contained (Three.js r128 inlined — no CDN, no network needed).
Open it directly in any browser, or serve the folder:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## The 19 scenes
| # | Scene | What scroll does |
|---|-------|------------------|
| 01 | THE VOID | One particle → splits → neural network; camera enters the system |
| 02 | THE WORLD | Network morphs into dust/fog/architecture; distant NPC revealed |
| 03 | THE NPC | Particles converge into **GARRICK** — gold key light, cyan rim, letterbox |
| 04 | COGNITION | World darkens, cyan motes, camera orbits |
| 05 | MEMORY | Garrick dissolves into a 3D memory graph (TRUST / THREAT / QUEST…) |
| 06 | RECALL | Memory #0413 hologram → collapse → memory #0877 → network re-weights |
| 07 | THE QUESTION | PLAYER types “What happened here?” — a data pulse fires through 5 gates |
| 08 | PROCESSING | Chamber fly-through: 4 high-level states (no chain-of-thought) |
| 09 | THE PRICE | Gold transaction tunnel; HTTP 402 / 0.01 USDC / Base Sepolia / EIP-191 |
| 10 | SETTLEMENT | 7-stage transaction, hex streams, secp256k1 signing curve — *DEMO TRANSACTION* |
| 11 | TRANSMUTATION | Gold particles become cyan — value becomes intelligence |
| 12 | THE CORE | Million-particle AI core converges |
| 13 | THE ANSWER | Core reforms into Garrick; his line lands |
| 14–15 | THE WORLD / UNIVERSE | Other NPCs (LYRA, VAELATHOR…) with live data cards |
| 16 | THE INTERFACE | World flattens into a floating code lattice — CODE → AI → CHARACTER |
| 17 | PLAYGROUND | Working API playground: run the request, watch 402 → sign → settle → stream |
| 18 | THE NETWORK | Pull back: everything is connected |
| 19 | MAKE THEM ALIVE | Void, silhouette, final CTAs |

## Interaction layer
- Scroll = camera timeline (smooth inertia, eased keyframes over ~57 screens)
- Cursor-reactive particles (repulsion field at focal depth)
- Hover a **memory node** → connected memories illuminate
- Hover an **NPC** → they glance toward your cursor (card tilt + trust meters)
- Magnetic buttons, custom cursor (cyan / gold contexts)
- **Playground**: edit the JSON request — responses are keyword-aware (try mentioning a sword)

## Performance & resilience
- Desktop: ~15k morph-target particles + lines + dust, GPU points, one draw call per system
- Mobile: auto-reduced counts (≈5k), DPR clamp, no cursor field, stacked playground
- `prefers-reduced-motion`: inertia off, twinkle/grain frozen
- No WebGL → automatic static cinematic fallback (all 19 chapters as a readable page)
- Verified headless: 0 runtime errors across all scenes, mobile viewport, and fallback

## Structure
```
index.html      ← the deliverable (self-contained, ~700 KB)
build.py        ← rebuilds index.html from src/
src/            ← style.css, template, app1-4.js (timeline · shapes · engine · act III/UI)
vendor/         ← three.min.js r128
key-art/        ← 7 cinematic concept frames (one per key beat, shared visual language)
```

*Everything on this page is simulated — no real blockchain transactions occur.*
