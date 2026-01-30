// tokens.ts - Export design tokens extending CSS variables
import { DesignTokens } from './types';

export const tokens: DesignTokens = {
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
    },
    radius: {
        sm: '0.1875rem',
        md: '0.375rem',
        lg: '0.5625rem',
        xl: '1rem',
        full: '9999px'
    },
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem'
    },
    touchTarget: {
        min: '44px',
        preferred: '48px'
    },
    animation: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms'
    },
    shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    }
};

// Component-specific tokens
export const componentTokens = {
    card: {
        background: 'hsl(var(--card))',
        border: 'hsl(var(--border))',
        glass: 'rgba(255, 255, 255, 0.7)',
        glassDark: 'rgba(30, 30, 40, 0.7)',
    },
    button: {
        minHeight: tokens.touchTarget.min,
        paddingX: tokens.spacing.lg,
        paddingY: tokens.spacing.md,
    }
};
