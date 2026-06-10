---
name: Riverside Ink Rhyme
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbeb'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5efff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#3e4948'
  inverse-surface: '#27313e'
  inverse-on-surface: '#e9f1ff'
  outline: '#6e7979'
  outline-variant: '#bdc9c8'
  surface-tint: '#006a6a'
  primary: '#005e5e'
  on-primary: '#ffffff'
  primary-container: '#157878'
  on-primary-container: '#a8fdfc'
  inverse-primary: '#80d4d4'
  secondary: '#186c43'
  on-secondary: '#ffffff'
  secondary-container: '#a1f1bd'
  on-secondary-container: '#1e7047'
  tertiary: '#883f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a95514'
  on-tertiary-container: '#ffebe0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf1f0'
  primary-fixed-dim: '#80d4d4'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#a4f4c0'
  secondary-fixed-dim: '#88d7a5'
  on-secondary-fixed: '#002110'
  on-secondary-fixed-variant: '#00522f'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb68a'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743500'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
  jiang-blue: '#157878'
  nature-green: '#3D8B5F'
  cuisine-orange: '#D97A38'
  photo-purple: '#7B5EA7'
  ink-black: '#1A2430'
  river-bg: '#F6F8F8'
  border-gray: '#DFE3E6'
typography:
  display:
    fontFamily: PingFang SC
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.2'
  h1:
    fontFamily: PingFang SC
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.3'
  h2:
    fontFamily: PingFang SC
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.35'
  h3:
    fontFamily: PingFang SC
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.45'
  body-lg:
    fontFamily: PingFang SC
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: PingFang SC
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  caption:
    fontFamily: PingFang SC
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: PingFang SC
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  section: 80px
  sub-section: 40px
  grid-gap: 24px
  container-padding: 24px
  compact-padding: 16px
  max-width: 1200px
---

## Brand & Style

The brand personality is refined, culturally rooted, and serene, drawing deep inspiration from the Yangtze River and the traditional Hui-style architecture of Wuhu. It aims to evoke a sense of "freshness and natural beauty" through a sophisticated, high-end digital experience.

The design style is **Corporate / Modern** with **Minimalist** and **Tactile** influences. It prioritizes functional clarity and high-impact visual asymmetry to avoid "grid fatigue." A key differentiator is the integration of architectural identity through traditional Anhui-style decorative elements—such as fragmented horizontal lines and subtle ink-wash patterns—creating a UI that feels uniquely local yet technologically advanced.

## Colors

The palette, named "Riverbank Ink Rhyme," utilizes a cold-toned foundation to maintain a premium, fresh atmosphere.

- **Primary (Jiang Blue):** Used for navigation, primary actions, and active states. It represents the Yangtze River.
- **Secondary (Nature Green):** Applied to scenery tags, star ratings, and success states.
- **Tertiary (Cuisine Orange):** A high-contrast call-to-action color for "Hot" badges and food-related discovery.
- **Neutral (Ink Black):** Used for primary typography to ensure high legibility against the cold-white background.
- **Background (Cold White):** `#F6F8F8` is the default page background, providing a crisp, modern feel that avoids the muddiness of warm grays.

**Gradients:**
- Use a `linear-gradient(to top, rgba(26,36,48,0.72), transparent)` overlay on images to ensure white text readability.
- Category backgrounds use 2-step gradients from the named colors to their darker variants (e.g., Nature Green `#3D8B5F` to `#2E6E48`).

## Typography

The system utilizes a sans-serif stack optimized for Chinese legibility, centered on **PingFang SC**. The hierarchy is designed to guide the user through content-heavy travel descriptions with ease.

- **Headlines:** Use heavy weights (600-700) to create a strong visual anchor.
- **Body Text:** Standardized at 15px with a generous 1.6 line height to improve long-form reading comfort.
- **Metadata:** Captions and labels use smaller sizes but maintain medium weights to remain accessible and scannable.
- **Constraints:** Limit body text containers to a maximum width of `65ch` to prevent eye fatigue on desktop screens.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop with a maximum content width of `1200px`. 

- **Sectioning:** Large vertical gaps of `80px` separate major content areas, creating a breathable, high-end feel.
- **Grid System:** Content cards are arranged with a consistent `24px` gutter. 
- **Hero Architecture:** The home page features an asymmetrical 40/60 split between text and image carousels.
- **Responsive Behavior:** On desktop, use a standard 5vw page margin to ensure the layout feels centered and intentional regardless of screen width.

## Elevation & Depth

Visual hierarchy is established using a combination of **Ambient Shadows** and **Tonal Layering**.

- **Surface Tiers:** Cards and containers use pure `#FFFFFF` to stand out against the `#F6F8F8` background.
- **Shadow Character:** Shadows are extremely soft and low-opacity (`rgba(0,0,0,0.06)` to `0.12`).
- **Interactive Depth:** 
    - Default cards use a subtle 8px blur shadow. 
    - Hover states increase elevation to a 16px blur with a `translateY(-6px)` lift.
- **AI Components:** The AI Chat interface and dropdowns occupy the highest elevation tier, using a heavy 24px blur to signify priority and temporary focus.

## Shapes

The shape language is sophisticated and predominantly **Rounded**.

- **Standard Radius:** `12px` (Large) is applied to primary cards, carousels, and scenery images to evoke a friendly, modern feel.
- **UI Elements:** Buttons and interactive controls use a slightly sharper `8px` radius to maintain a sense of precision.
- **Inputs:** Form fields use a `6px` radius.
- **Decorative Elements:** Hui-style architectural patterns are represented as 2px high fragmented horizontal lines, used as section dividers or heading underlines to reinforce the brand's cultural identity.

## Components

### Buttons
- **Primary:** Solid `#157878` background, white text, 8px radius. Padding: `14px 36px`.
- **Secondary/Tag:** Subtle backgrounds based on category colors (e.g., `#3D8B5F` for nature) with a 500-weight label.
- **Interaction:** Use an elastic easing `cubic-bezier(0.34, 1.56, 0.64, 1)` for hover scales.

### Cards
- **Structure:** 12px radius, `#FFFFFF` surface.
- **Visuals:** Images should scale slightly (`1.05x`) on hover within their containers.
- **Shadows:** Smooth transition from Light to Medium shadow on hover.

### AI Chat (Floating)
- **Button:** 56px circle (Full radius) in Primary color.
- **Window:** High elevation shadow (Heavy), 12px radius, opens with a `scale(0 to 1)` animation from the bottom right.

### Input Fields & Search
- **Styling:** 6px radius, `--color-border` outline, `#F6F8F8` or `#FFFFFF` fill.
- **Active State:** Border transitions to Primary Blue.

### Lists & Categories
- **Layout:** Break grid monotony with a "2+1+1" layout for categories.
- **Icons:** Use `element-plus/icons-vue` with 36px sizing for category entries.