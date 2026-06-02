---
name: Industrial Excellence
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#44474d'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4f5f7b'
  primary: '#04162e'
  on-primary: '#ffffff'
  primary-container: '#1a2b44'
  on-primary-container: '#8292b0'
  inverse-primary: '#b6c7e7'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#141718'
  on-tertiary: '#ffffff'
  tertiary-container: '#282b2c'
  on-tertiary-container: '#909293'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b6c7e7'
  on-primary-fixed: '#091c34'
  on-primary-fixed-variant: '#374762'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-display:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  margin-desktop: 80px
  margin-tablet: 40px
  margin-mobile: 20px
  gutter: 24px
  section-padding: 120px
---

## Brand & Style

The design system is engineered to evoke **Industrial Excellence**, positioning the product as a premium authority in industrial real estate. The visual narrative moves away from the ephemeral nature of tech startups and leans into the permanence and scale of physical infrastructure. It targets high-net-worth investors and institutional logistics partners who value stability, scale, and professional transparency.

The style is characterized by a **High-End Brochure** aesthetic:
- **Corporate & Modern:** Rooted in professional reliability with a structured, systematic layout.
- **Architectural Precision:** Utilizing sharp edges, clear demarcations, and a strict adherence to grid systems to reflect the nature of industrial planning.
- **Spacious & Editorial:** Heavy use of purposeful whitespace to create a sense of scale and premium positioning, mirroring the vastness of the real estate assets.
- **Authoritative:** A "no-nonsense" visual language that prioritizes clarity and high-quality photography over decorative UI elements.

## Colors

The palette is derived directly from the core values of trust and high-end consultancy:
- **Primary (Deep Navy):** Represents authority, professional depth, and global logistics. Used for primary text, headers, and structural backgrounds.
- **Secondary (Industrial Gold):** An accent color symbolizing investment value, premium service, and excellence. Used sparingly for highlights, call-to-actions, and key data points.
- **Neutral (Alabaster & Slate):** The background is predominantly clean white or off-white to ensure a spacious feel. Grays are used for secondary information to maintain a sophisticated hierarchy.

The default state is **light mode**, reinforcing the "clean brochure" feel, with deep navy sections used to create high-impact "anchor" areas in the layout.

## Typography

The typography system is built for authority and legibility.
- **Headlines:** Uses **Hanken Grotesk** for its sharp, contemporary, and architectural feel. The display sizes use tight letter spacing and heavy weights to command attention, mirroring the physical presence of a warehouse.
- **Body Text:** Uses **Work Sans** for its exceptional clarity and professional neutrality. It ensures that data-heavy descriptions and investment details remain highly readable.
- **Labels:** Small caps with increased tracking are used for categorizing data and "metadata" tags, providing a structured, organized appearance common in high-end financial reports.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy on desktop to maintain the disciplined look of a printed brochure.
- **Desktop:** A 12-column grid with wide margins (80px) and substantial section padding (120px) to allow content to breathe. 
- **Rhythm:** Spacing follows a base-8 unit system, but primary layout gaps are intentionally oversized to signify luxury and "room to grow."
- **Imagery:** Large, full-bleed high-quality industrial photography should be used to anchor sections, often spanning 8 or 12 columns to provide context and scale.
- **Reflow:** On mobile, the grid collapses to 4 columns, margins tighten to 20px, and typography scales down to maintain the hierarchy without overwhelming the smaller viewport.

## Elevation & Depth

To maintain the "Industrial Excellence" aesthetic, depth is conveyed through **Low-Contrast Outlines** and **Tonal Layers** rather than soft shadows.
- **Borders:** Use crisp, 1px borders in a light gray or muted navy to define containers. This mimics blueprints and technical drawings.
- **Tonal Stepping:** Use the Tertiary color (light gray/off-white) to create subtle background blocks that separate content without the need for elevation.
- **Shadows:** Avoid soft, ambient shadows. If a shadow is required for a floating element (e.g., a modal), use a sharp, minimal offset with low blur (e.g., 4px blur, 10% opacity navy) to keep the look grounded and physical.

## Shapes

The shape language is strictly **Sharp (0)**. 
- All UI elements—buttons, cards, and input fields—utilize 0px corner radii. 
- This reinforces the architectural and industrial nature of the brand, signaling precision, engineering, and structural integrity. 
- Circular elements are reserved strictly for icons or small decorative status indicators to provide a functional contrast.

## Components

### Buttons
Primary buttons are solid Navy with White text, sharp corners, and a 16px vertical / 32px horizontal padding. Secondary buttons use the Industrial Gold color or a Gold outline with Navy text.

### Cards
Card containers have no rounded corners and 1px light gray borders. For property listings, the card header should be a high-resolution image, followed by a structured data grid for specs (SQFT, Location, Power Capacity) using the `label-caps` style.

### Input Fields
Inputs are minimalist: a 1px bottom border or a full 1px light gray border. Focus states use a Navy border with a 2px stroke. No rounded corners.

### Lists & Tables
Industrial real estate is data-driven. Tables should be spacious, using the Navy color for headers and horizontal-only separators to maintain a clean, architectural flow.

### Chips & Tags
Used for status (e.g., "Available", "Under Contract"). These are rectangular blocks with no rounded corners, using high-contrast colors (Gold background for "Premium" or "Featured").

### Featured Assets
A custom component for showcasing "Guru Picks" or prime locations, utilizing a split-screen layout with full-height imagery on one side and structured investment data on the other.