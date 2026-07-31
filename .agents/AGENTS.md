# Project-Scoped AI Rules: Metaphor OS

## UI/UX Design System Enforcement

You (the AI agent) must STRICTLY adhere to the following UI/UX rules when generating or modifying React components in this workspace. These rules exist to prevent "AI Slop" (muddy contrast, inconsistent padding, and harsh borders).

### 1. Component-Driven Architecture
- **Rule:** DO NOT manually wire basic HTML elements with massive arbitrary Tailwind strings for cards, panels, or tags.
- **Action:** You must ALWAYS compose UI using the established primitives in `src/components/ui/` (e.g., `<Card>`, `<Badge>`).

### 2. Design Token Lockdown (No Arbitrary Values)
- **Rule:** You are FORBIDDEN from using arbitrary Tailwind background, border, or text opacities (e.g., NEVER use `bg-white/10`, `border-white/5`, `bg-gray-800`).
- **Action:** You must ONLY use the semantic tokens defined in the `globals.css` `@theme` block.
  - Backgrounds: Use `bg-background`, `bg-surface-1`, `bg-surface-2`.
  - Borders: Use `border-subtle`, `border-strong`.
  - Text: Use `text-foreground`, `text-muted`, `text-bright`.

### 3. The 8pt Baseline Grid
- **Rule:** All padding and margins must follow an 8pt (0.5rem) scale.
- **Action:** Only use Tailwind spacing utilities that align with this (e.g., `p-2` (8px), `p-4` (16px), `p-6` (24px)). Do not use `p-3` or `p-5` for structural container padding.

### 4. Typography Hierarchy
- **Rule:** Do not rely on default browser typography sizing.
- **Action:** 
  - Section headers must be `text-xs uppercase tracking-widest font-bold text-muted`.
  - Primary data points (like KPI numbers) must use `tracking-tight`.

### 5. Glassmorphism Discipline
- **Rule:** Never use a solid 1px border for glass panels. It looks cheap.
- **Action:** Glass panels (handled by the `<Card>` primitive) must use multi-layered box-shadows (inset shadows) for edges, rather than raw CSS borders.
