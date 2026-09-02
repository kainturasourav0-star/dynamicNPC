# Design System & UI/UX Guidelines

This document outlines the visual layout, color systems, and UI styles of the Brainwave x402 Developer Console.

---

## 1. Visual Language & Theme

The platform implements a premium, high-contrast **dark mode interface** designed to appeal to web3 and game developers.

### 1.1 Color Palette
*   **Backgrounds**: Primary slate-950 (`#020617`), card backgrounds slate-900 with 60% opacity (`rgba(15, 23, 42, 0.6)`).
*   **Accents**: Vibrant Indigo-600 (`#4f46e5`) and Purple-600 (`#7c3aed`) representing AI capabilities. Emerald-500 (`#10b981`) for successful payments and active keys. Amber-500 (`#f59e0b`) for pending challenges. Rose-500 (`#f43f5e`) for failed requests or errors.
*   **Typography**: Clean sans-serif system font stack (Inter/system-ui) with mono fonts for keys, transactions, and JSON logs.

### 1.2 UI Aesthetics
*   **Radial Glows**: Subtle blur filters (e.g. `bg-indigo-600/10 rounded-full blur-[120px]`) are placed in the background to add depth.
*   **Glassmorphism**: Semi-transparent cards with border lines (`border-slate-800`) and backdrop filters (`backdrop-blur-md`) create a premium layer stack.
*   **Micro-Animations**: Hover transitions (`transition-colors duration-200`), spinning loaders, and gentle bouncing icons highlight user interactions.

---

## 2. Page & Component Layouts

### 2.1 Landing Page (`src/app/page.tsx`)
*   Centered layout presenting a clean, rounded-3xl container card with a soft shadow.
*   Presents clear call-to-actions (CTAs) for console entry (Login) and API reading (Docs).

### 2.2 Auth Forms (`src/app/login` & `src/app/signup`)
*   Forms are wrapped in high-impact card components.
*   Inputs feature left-aligned Lucide icons (Mail, Lock, User) and focus-rings.
*   Subtle notifications indicate auto-registration, lowering signup friction.

### 2.3 Dashboard Grid (`src/app/dashboard/page.tsx`)
*   **Key Stats**: A responsive 4-column grid (Total API Calls, Revenue Settled, Active NPCs, API Keys Count) utilizing custom gradient backgrounds (`from-... to-...`) and distinct status colors.
*   **Split Panel**:
    *   *Left Column (2/3 width)*: Tabular log detailing the 5 most recent requests, with status-colored tags.
    *   *Right Column (1/3 width)*: Architectural guide detailing the challenge-sign-settle steps.

### 2.4 Modals & CRUD UI (`src/app/dashboard/npcs/page.tsx` & `/keys/page.tsx`)
*   Centered layout overlays with dark backdrops (`bg-slate-950/80 backdrop-blur-sm`).
*   Form elements are clean, stacked, and use high-contrast placeholders to assist data entry.

---

## 3. NPC-402 Cinematic 3D Scroll Experience (`design-system/npc-402`)

The NPC-402 design showcase represents the continuous scroll-driven cinematic shot traversing the complete lifecycle of an autonomous AI NPC:
**CHARACTER → MEMORY → PLAYER INPUT → CONTEXT → PAYMENT → AI → RESPONSE → LIVING WORLD → DEVELOPER PLATFORM → NPC-402**

Self-contained interactive deliverable: [`design-system/npc-402/index.html`](file:///d:/brainwave%28x402%29/design-system/npc-402/index.html)

### 3.1 The 19 Cinematic Scenes
| # | Scene | Visual Beat & Scroll Action |
|---|-------|-----------------------------|
| **01** | **THE VOID** | Single particle origin point → splits into neural network lattice; camera plunges into the system. |
| **02** | **THE WORLD** | Network geometry morphs into atmospheric dust, volumetric fog, and distant cyber-dungeon architecture. |
| **03** | **THE NPC** | 15k particles converge into **GARRICK** with gold key light, cyan rim highlights, and widescreen letterbox framing. |
| **04** | **COGNITION** | Ambient environment dims, luminous cyan motes swirl, orbital camera rotation. |
| **05** | **MEMORY** | Garrick dissolves into a 3D memory graph with dynamic semantic clusters (`TRUST`, `THREAT`, `QUEST`). |
| **06** | **RECALL** | Memory `#0413` hologram crystallizes → collapses → Memory `#0877` activates → graph re-weights in real-time. |
| **07** | **THE QUESTION** | PLAYER types *"What happened here?"* — a high-speed data pulse fires through 5 evaluation gates. |
| **08** | **PROCESSING** | Camera fly-through across 4 high-level state chambers without exposing raw chain-of-thought. |
| **09** | **THE PRICE** | Gold transaction tunnel emerges: `HTTP 402 Payment Required` / `0.01 USDC` / `Base Sepolia` / `EIP-191`. |
| **10** | **SETTLEMENT** | 7-stage transaction progression with hex streams and secp256k1 signature verification curve. |
| **11** | **TRANSMUTATION** | Gold payment particles transmute into electric cyan — financial value converting directly into machine intelligence. |
| **12** | **THE CORE** | One-million particle simulated AI core collapses inward at extreme velocity. |
| **13** | **THE ANSWER** | Core reforms back into Garrick; character speech line delivers with dynamic audio-reactive styling. |
| **14–15** | **THE WORLD / UNIVERSE** | Ecosystem expansion revealing auxiliary NPCs (**LYRA**, **VAELATHOR**) with interactive real-time telemetry cards. |
| **16** | **THE INTERFACE** | 3D space flattens into a floating code lattice: `CODE → AI → CHARACTER`. |
| **17** | **PLAYGROUND** | Fully interactive API playground: execute requests, witness 402 challenge → sign → settle → response stream. |
| **18** | **THE NETWORK** | Wide camera pullback showing global interconnected NPC memory networks. |
| **19** | **MAKE THEM ALIVE** | Void return with dramatic character silhouettes and primary call-to-action triggers. |

### 3.2 Interaction & Rendering Architecture
*   **Camera Timeline**: Continuous scroll timeline with inertia smoothing and eased keyframes across ~57 viewport heights.
*   **Particle Repulsion Field**: Cursor-reactive GPU point cloud dynamic repulsion at focal depth plane.
*   **Graph Illumination**: Hovering memory nodes lights up connected semantic nodes and weights.
*   **NPC Cursor Tracking**: Characters calculate cursor vector angle, tilting telemetry cards and shifting gaze.
*   **Key Art & Asset Reference**: Concept visual frames located in [`design-system/npc-402/key-art/`](file:///d:/brainwave%28x402%29/design-system/npc-402/key-art/) and [`public/key-art/`](file:///d:/brainwave%28x402%29/public/key-art/).
*   **Design Tokens**: Master token architecture documented in [`design-system/npc-402/MASTER.md`](file:///d:/brainwave%28x402%29/design-system/npc-402/MASTER.md).

