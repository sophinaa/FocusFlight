// Global Tailwind-style design tokens for consistent styling.
export const DesignTokens = {
  colors: {
    bgMain: '#050816', // cockpit / night flight background
    bgCard: '#0f172a', // panels and cards
    accent: 'dynamic', // depends on map style (set elsewhere)
    textMain: '#e5e7eb',
    textMuted: '#9ca3af',
    danger: '#b91c1c',
  },
  radii: {
    cardRadius: 18, // 16-20px sweet spot
    buttonRadius: 999, // pill for primary CTAs
  },
  spacing: {
    screenPadding: 22, // 20-24px
    cardPadding: 18, // 16-20px
    gapSmall: 8,
    gapMedium: 14, // 12-16px midpoint
    gapLarge: 22, // 20-24px
  },
  typography: {
    h1: { size: 28, weight: '700' }, // ≈ text-2xl/3xl
    h2: { size: 18, weight: '600' }, // ≈ text-lg, semibold
    body: { size: 14, weight: '400' }, // ≈ text-sm/base
    timer: { size: 52, weight: '800' }, // ≈ text-5xl/6xl
    label: { size: 12, weight: '500' }, // ≈ text-xs, medium
  },
};
