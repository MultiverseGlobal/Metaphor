---
name: metaphor-design
description: Metaphor's project-local creative overhaul rules and design system contract.
---

# Metaphor Design System & Creative Overhaul

## 1. Design Read

> Creative visual workspace for art-and-taste users, with a quiet white-glass material language, black-ink contrast, and physical water-like cursor motion.

**Dial Values:**
- `DESIGN_VARIANCE: 8` (Authored composition, memorable interaction signature)
- `MOTION_INTENSITY: 7` (Noticeable but controlled motion)
- `VISUAL_DENSITY: 3` (Generous whitespace, small number of visible decisions)

## 2. Token Contract

| Token | Semantic Purpose |
| --- | --- |
| `sea-base` (#F7F8F6) | Warm, near-white field. Keep the background quiet and low frequency. |
| `sea-highlight` (White 70-92%) | Soft local lift or specular response. Never use as white text without a backing. |
| `sea-shadow` (#D9DEE2 18-32%) | Restrained displacement and depth cue. No colored bloom. |
| `glass-regular` (White 68-82%) | Text-heavy navigation and controls. Pair with blur only when supported. |
| `glass-clear` (White 36-58%) | Short labels or media-like overlays only. Add a contrast stabilizer over bright content. |
| `glass-border` (White 55-75%) | One-pixel edge highlight. Avoid repeated border rows. |
| `ink` (#111315) | Cursor, primary text, active marks, decisive actions, and focus anchor. |
| `ink-secondary` (#3B4043) | Secondary text and supporting controls. Verify contrast over motion. |
| `structure` (#AEB7BC) | Quiet orientation and non-essential dividers. Never use for primary copy. |
| `focus-ring` (#111315, 2-3px) | Always present for keyboard focus. Independent of the canvas. |
| `scrim` (#111315 36-54%) | Blocking modal only. Do not use for ordinary panels. |
| `radius` (10 / 16 / 24 px) | One restrained family. Do not invent per-component radii. |
| `shadow-soft` (0 14px 40px, black 8-12%) | One elevation family. Keep the field visually open. |
| `blur-regular` (18-28px) | Central glass only; feature-detect support. |
| `blur-clear` (8-14px) | Short overlays only. Provide a solid fallback. |

## 3. Copy Bans
- No em dash or en dash used as a separator.
- No numbered eyebrows or decorative labels above the main statement.
- No hero version labels.
- No fake timestamps, locations, activity counts, or telemetry.
- No ornamental status dots.
- No generic AI claims or promises that the interface cannot demonstrate.
- No “click here,” “submit,” or “continue” when the object and outcome can be named.

## 4. State Model & Interaction Invariants
- **First Viewport:** One dominant workspace, one primary action, one compact navigation layer.
- **Glass:** One functional glass layer for navigation/controls. Glass does not cover every card.
- **The Wake:** A subtle black/gray wake follows cursor direction, fades naturally. Click creates one restrained ripple. The ripple is feedback, not navigation.
- **Progressive Disclosure:** Keep advanced controls in a contextual glass tray after selection.
- **Accessibility/Reduced Motion:** Remove continuous sea drift, cursor parallax, and persistent trails. Replace traveling ripples with an immediate static dark focus ring or brief opacity change.

## 5. Audit Checklist (Pre-Flight)
Before implementing UI changes, ensure:
- [ ] No generic AI-purple gradients.
- [ ] No dense dashboard sidebars or panel stacking.
- [ ] Contrast meets WCAG AA (4.5:1 normal text, 3:1 large text).
- [ ] Fallbacks exist for `backdrop-filter`.
- [ ] The change respects the 3-layer architecture (Sea -> Glass -> Ink).
