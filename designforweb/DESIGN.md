---
name: NPC-402 Protocol Kinetic
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#a4d64c'
  on-secondary: '#233600'
  secondary-container: '#719e13'
  on-secondary-container: '#1e2f00'
  tertiary: '#ffb873'
  on-tertiary: '#4b2800'
  tertiary-container: '#e89337'
  on-tertiary-container: '#5b3200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#bff365'
  secondary-fixed-dim: '#a4d64c'
  on-secondary-fixed: '#131f00'
  on-secondary-fixed-variant: '#354e00'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-elevated: '#0C0C0C'
  text-muted: '#D2D2D2'
  border-subtle: '#2F323B'
  glow-cyan: rgba(6, 182, 212, 0.4)
  glow-lime: rgba(190, 242, 100, 0.4)
typography:
  display-2xl:
    fontFamily: Inter
    fontSize: 120px
    fontWeight: '900'
    lineHeight: 110px
    letterSpacing: -0.05em
  display-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  mono-label:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.1em
  mono-code:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-edge: 64px
  section-gap: 160px
---

## Brand & Style

The visual identity of the design system is rooted in the "Independent Digital Studio" aesthetic—a blend of high-end craftsmanship and futuristic technical precision. It is designed to evoke a sense of "The Future of Infrastructure": cold, calculated, yet undeniably premium.

The style leverages **Minimalism** with **Glassmorphism** and **High-Contrast** accents. It prioritizes motion and depth, utilizing deep obsidian backgrounds to allow vibrant, kinetic accents to "glow" as if projected. The layout philosophy is non-linear, favoring asymmetrical compositions that break the standard grid to create a sense of bespoke, award-winning digital artistry. Subtle grain textures are applied to surfaces to eliminate sterile gradients, providing a tactile, filmic quality to the digital interface.

## Colors

This design system utilizes a "Deep Tech" dark mode palette. The foundation is `#050505`, a near-black that provides infinite depth for high-contrast typography. 

- **Primary (Electric Cyan):** Used for primary actions, progress indicators, and technical "active" states. It should often be accompanied by an outer glow or blur to simulate a light-source effect.
- **Secondary (Electric Lime):** Reserved for highlights, success states, and breaking visual monotony. 
- **Neutral:** The palette relies on high-contrast white for readability and mid-tone grays for metadata and secondary labels.
- **Translucency:** Glassmorphic elements use background blurs with a `10-15%` white or primary-tinted overlay to maintain legibility against complex backgrounds.

## Typography

The typography strategy relies on extreme contrast between scale and style. 

- **Headlines:** Use **Inter** with heavy weights (ExtraBold/Black). Tracking must be tightened (`-4%` to `-5%`) to create a "block" of text feel typical of high-end agencies. Large display type should often be used as a background element or clipped by imagery.
- **Body:** **Inter** is kept clean and spacious. Line heights are generous (`160%`) to ensure breathability against the dark background.
- **Technical Accents:** **Space Mono** is used exclusively for "Protocol" data, such as version numbers, timestamps, labels, and small UI captions. These should always be in uppercase with increased letter spacing to emphasize the technical nature of the product.

## Layout & Spacing

The layout follows a **Fluid Grid** model but encourages "Grid Breaking." 

- **The 12-Column System:** Use a standard 12-column grid for alignment, but allow hero elements and large imagery to bleed into the margins or overlap column boundaries.
- **Asymmetry:** Pair large headlines on the left with small mono-labels or body copy pushed to the far right to create a sophisticated, unbalanced visual tension.
- **Vertical Rhythm:** Use massive vertical gaps (`section-gap`) between content blocks to allow the eye to rest and emphasize the importance of each individual section.
- **Mobile Adaptivity:** On mobile, the 12-column grid collapses to 4. Asymmetrical overlaps should be simplified into a vertical stack, while maintaining the "Display" scale of typography, even if it requires hyphenation or overflow.

## Elevation & Depth

In this design system, depth is created through **Luminance and Blur** rather than traditional shadows.

1.  **The Void:** The base layer is `#050505`. 
2.  **Elevated Planes:** Components like cards use a subtle fill of `#0C0C0C` with a 1px border of `#2F323B`.
3.  **Glassmorphism:** Navigation bars and floating panels use a high-refraction backdrop blur (`20px - 40px`) with a very low opacity white stroke (`white 10%`) to define the edge.
4.  **Kinetic Glows:** Interactive elements (like active buttons or hovered cards) should emit a soft, diffused radial gradient behind them using the Cyan or Lime accent colors at 20% opacity. This "under-glow" suggests the interface is powered by an internal light source.
5.  **Texture:** A persistent, low-opacity noise texture (grain) should be overlaid across the entire UI to prevent "banding" on dark gradients and add a premium, tactile finish.

## Shapes

The shape language is **Sharp and Architectural**. 

To maintain the high-end, technical "Protocol" feel, we avoid rounded corners on structural elements. All primary containers, buttons, and input fields utilize **0px (Sharp)** corners. This reinforces the precision and brutalist-adjacent aesthetic of the agency style. 

The only exception to the sharp rule is for specific "Human" elements like user avatars or circular iconography, which should be perfect circles to contrast against the rigid rectangular grid of the UI.

## Components

- **Buttons:** Rectangular with 0px radius. Primary buttons are solid White or Cyan with Black text. Secondary buttons are "Ghost" style with a 1px white border. Hover states should trigger a "fill" animation or a glowing shadow effect.
- **Inputs:** Minimalist bottom-border only or a full-box with a 1px `#2F323B` stroke. On focus, the border should glow Cyan.
- **Cards:** Use the "Elevated Plane" logic. No shadows, just a subtle background color shift and a 1px border. Content inside should follow the asymmetrical layout rules (e.g., a mono-label in the top-right corner).
- **Custom Cursor:** A custom circular cursor (approx 20px) that inverts the colors of the content beneath it. When hovering over clickable elements, the cursor should expand and show a "View" or "Explore" label in Space Mono.
- **Navigation:** A floating glassmorphic bar at the top or a full-screen "Curtain" menu that slides down with a smooth, high-damping spring animation.
- **Progress Indicators:** Fine, 1px horizontal lines in Electric Lime that crawl across the top of the viewport or section during scroll-triggered events.