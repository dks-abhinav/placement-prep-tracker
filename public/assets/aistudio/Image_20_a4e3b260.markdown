---
name: Placement Prep Tracker
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  data-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  gutter-desktop: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for ambitious Indian engineering undergraduates (CSE, ECE, IT) navigating the high-stakes campus placement season (Day 0/Day 1 drives, product hiring, and mass recruitment). The UI prioritizes cognitive clarity, structured urgency, and focused execution over recreational decoration. 

The aesthetic is Modern Corporate with Technical Utility—combining the rigor of developer tools with the pristine polish of modern productivity suites. It feels like an executive command center tailored for problem-solving sprints, tracking Online Assessments (OTs), Data Structures & Algorithms (DSA) sheets (Striver/Love Babbar), core CS fundamentals (OS, DBMS, CN), and system design milestones. The interface projects reliability, quiet confidence, and decisive progression.

## Colors

The palette balances clean functional whites and slates with focused operational signals:

- **Primary (`#2563eb` - Royal Blue):** Anchors core actions, active selection tabs, primary metrics, and focal progress indicators. Paired with `#3b82f6` for hover interactions and lighter tints (`#eff6ff`) for selected states.
- **Secondary (`#0f172a` - Deep Navy / Slate 900):** Provides authoritative structure. Applied to high-emphasis typography, critical headers, navigation shells, and high-impact structural containers. A secondary surface tone of `#1e293b` handles high-contrast badges and terminal-like code snippets.
- **Tertiary (`#10b981` - Emerald):** Reserved for victory and readiness milestones—solved leetcode problems, verified test-case clearances, completed revision rounds, and confirmed interview shortlists/offers.
- **Status Accents:**
  - **Warning / Deadlines (`#f59e0b` - Amber):** Highlights impending test deadlines, OA submission cutoff timers, and revision backlog warnings.
  - **Analytics (`#8b5cf6` - Violet):** Denotes performance analytics, company tier distribution, and mock interview benchmark scores.
- **Neutral Foundation:**
  - Canvas: `#f8fafc` (Slate 50)
  - Card & Surface: `#ffffff` (Pure White)
  - Subdued Borders: `#e2e8f0` (Slate 200)
  - Body Copy: `#334155` (Slate 700)
  - Muted Metadata: `#64748b` (Slate 500)

## Typography

The type system prioritizes high-density scannability and technical precision. `Inter` provides neutral, objective readability across UI labels, narrative questions, company descriptions, and analytical summaries. 

`JetBrains Mono` handles all data-heavy metrics, problem IDs (e.g., `LC-0042`), CTC salary numbers (LPA figures), deadlines, countdown clocks, test case trackers, and topic tags. This split separates descriptive administrative guidance from raw performance data.

## Layout & Spacing

The layout is anchored on a 12-column responsive fluid grid designed to hold dense dashboards without claustrophobia:

- **Desktop (1024px+):** Fixed 260px left-hand control rail (navigation, drive phase countdowns, active target filters), paired with a 12-column fluid workspace. The workspace splits cleanly between 8 columns (primary DSA sheets, OA task boards) and 4 columns (target company pipelines, upcoming interview schedule, daily quota progress).
- **Tablet (768px - 1023px):** Left rail collapses to a thin 64px icon dock. Content converts to an 8-column layout.
- **Mobile (<768px):** Single-column stacked stream. Secondary metrics collapse into swipeable cards or summary banners. Margins contract to 1rem.

Component spacing respects an 8px grid foundation (`0.25rem`, `0.5rem`, `0.75rem`, `1.25rem`, `2rem`), maintaining compact density across interactive table cells while leaving breathing room between distinct card panels.

## Elevation & Depth

Visual hierarchy uses flat crisp structural outlines reinforced by low-contrast ambient shadows:

- **Layer 0 (Canvas):** Pure `#f8fafc` background.
- **Layer 1 (Card & Module Surfaces):** Solid `#ffffff` with a continuous 1px outline of `#e2e8f0` and an ultra-subtle ambient drop shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)`.
- **Layer 2 (Elevated & Active Items):** Hover states, active question rows, and selected calendar days step up with `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)` and border shifts to `#cbd5e1`.
- **Layer 3 (Modals & Command Palettes):** Urgent assessment reminders, problem submission forms, and global search modals use `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)` with a backdrop blur of `4px` over a `#0f172a33` overlay.

## Shapes

The interface embraces a disciplined "Soft" corner geometry (`0.25rem` / 4px base radius, `0.5rem` / 8px for containers). This maintains an orderly, professional tool aesthetic, avoiding exaggerated consumer softness. 

- Data pills, status badges, and tag chips use strict `0.25rem` radius or full capsule pill rounding (`9999px`) purely when indicating binary states (e.g., Solved / Pending).
- Interactive inputs and base action buttons strictly stay at `0.375rem` (6px) to maintain a crisp mechanical finish.

## Components

### Buttons
- **Primary:** Solid `#2563eb` with white text, font weight 600, padding `0.5rem 1rem`, radius `0.375rem`. Hover: `#1d4ed8`. Focused: ring of 2px `#93c5fd`.
- **Secondary:** Surface `#ffffff`, border 1px solid `#cbd5e1`, text `#0f172a`. Hover: `#f8fafc`.
- **Destructive/Critical:** Soft red tint background `#fef2f2`, border `#fecaca`, text `#dc2626`.

### Chips & Data Pills
- **DSA Difficulty:**
  - Easy: `#ecfdf5` background, `#047857` text, 1px border `#a7f3d0`.
  - Medium: `#fffbeb` background, `#b45309` text, 1px border `#fde68a`.
  - Hard: `#fef2f2` background, `#b91c1c` text, 1px border `#fecaca`.
- **Company Tags:** Pill-shaped, `#f1f5f9` surface, `#334155` text with `JetBrains Mono` label, showcasing tier tags (e.g., `[Tier-1 / FAANG+]`, `[Product / 18-24 LPA]`).

### Cards & Metrics
- Plain white container (`#ffffff`), 1px solid `#e2e8f0`, radius `0.5rem`, padding `1.25rem`.
- Stat counters display a bold Inter 28px figure paired with an adjacent JetBrains Mono trajectory indicator (e.g., `+14 this week` in emerald).

### Tables & Question Lists
- Alternating row interaction: base white, hover background `#f8fafc`.
- Compact 40px cell height with integrated status checkboxes, direct LeetCode/CodeStudio link icons, revision count counters, and difficulty indicators.

### Checkboxes & Radios
- Checkboxes use `0.25rem` radius with a 1.5px border `#94a3b8`. Checked state turns `#2563eb` with a white checkmark.
- Radio buttons for test mode selection (e.g., "Timed Mock" vs "Practice") utilize concentric ring styling.

### Input Fields
- Height 38px, background `#ffffff`, border 1px solid `#cbd5e1`, text `#0f172a`, radius `0.375rem`.
- Focus state applies a 1px border of `#2563eb` and a 3px ambient ring of `#dbeafe`.

### Specialized Placement Prep Components
- **Assessment Countdown Banner:** Amber-accented header strip (`#fef3c7` bg, `#92400e` text) displaying upcoming OA window timelines with synchronized countdown clocks.
- **Syllabus Progress Ring:** Radial or linear micro-progress meters displaying topic mastery percentages (Graphs, Dynamic Programming, DBMS Concurrency) using emerald fill against `#e2e8f0` track.