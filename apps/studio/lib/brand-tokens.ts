/**
 * Evolution Stables Brand Design Tokens
 * 
 * ✅ NOW USING @evolution/brand MONOREPO PACKAGE!
 * 
 * This file re-exports tokens from the shared @evolution/brand package
 * to maintain backward compatibility with existing code.
 * 
 * Shared across:
 * - evolution-3.0 (evolutionstables.nz)
 * - Evolution Studios Engine (studio.evolutionstables.nz)
 * - Future Evolution products
 */

import { colors, typography, spacing, borderRadius, shadows, transitions } from '@evolution/brand';

// Re-export for backward compatibility with existing code
export const brandTokens = {
  colors: {
    // Primary Brand Colors
    gold: colors.gold.DEFAULT,
    charcoal: colors.charcoal.DEFAULT,
    charcoalLight: colors.charcoal.light,
    
    // Status Colors
    mint: colors.mint.DEFAULT,
    coral: colors.coral.DEFAULT,
    amber: colors.warning,
    blue: colors.info,
    
    // Neutral Colors
    slate: colors.text.secondary,
    background: colors.background.primary,
    foreground: colors.text.primary,
    border: colors.border.DEFAULT,
  },
  
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
      mono: 'var(--font-geist-mono), ui-monospace, monospace',
    },
    fontSize: {
      xs: typography.fontSize.xs[0],
      sm: typography.fontSize.sm[0],
      base: typography.fontSize.base[0],
      lg: typography.fontSize.lg[0],
      xl: typography.fontSize.xl[0],
      '2xl': typography.fontSize['2xl'][0],
      '3xl': typography.fontSize['3xl'][0],
      '4xl': typography.fontSize['4xl'][0],
      '5xl': typography.fontSize['5xl'][0],
    },
    fontWeight: {
      normal: String(typography.fontWeight.normal),
      medium: String(typography.fontWeight.medium),
      semibold: String(typography.fontWeight.semibold),
      bold: String(typography.fontWeight.bold),
    },
    lineHeight: {
      tight: typography.lineHeight.tight,
      normal: typography.lineHeight.normal,
      relaxed: typography.lineHeight.relaxed,
    },
  },
  
  spacing: {
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[4],
    lg: spacing[6],
    xl: spacing[8],
    '2xl': spacing[12],
    '3xl': spacing[16],
  },
  
  borderRadius: {
    sm: borderRadius.sm,
    md: borderRadius.DEFAULT,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
    full: borderRadius.full,
  },
  
  shadows: {
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
    xl: shadows.xl,
  },
  
  transitions: {
    fast: transitions.duration.fast + ' ' + transitions.timing.DEFAULT,
    normal: transitions.duration.DEFAULT + ' ' + transitions.timing.DEFAULT,
    slow: transitions.duration.slow + ' ' + transitions.timing.DEFAULT,
  },
} as const;

// Type exports for TypeScript
export type BrandColors = typeof brandTokens.colors;
export type BrandTypography = typeof brandTokens.typography;
export type BrandSpacing = typeof brandTokens.spacing;

// Re-export the raw tokens for direct access
export { colors, typography, spacing, borderRadius, shadows, transitions };
