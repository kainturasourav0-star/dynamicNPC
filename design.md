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
