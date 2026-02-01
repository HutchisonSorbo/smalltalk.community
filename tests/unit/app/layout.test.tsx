
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock Dependencies
vi.mock('@vercel/analytics/next', () => ({
    Analytics: () => <div data-testid="analytics" />
}));

vi.mock('@vercel/speed-insights/next', () => ({
    SpeedInsights: () => <div data-testid="speed-insights" />
}));

vi.mock('next/font/google', () => ({
    Inter: () => ({ className: 'inter-font' })
}));

vi.mock('@/app/providers', () => ({
    Providers: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>
}));

vi.mock('@/components/providers/AccessibilityContext', () => ({
    AccessibilityProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="a11y-provider">{children}</div>
}));

vi.mock('@/components/SkipToContent', () => ({
    SkipToContent: () => <div data-testid="skip-link" />
}));

vi.mock('@/components/shared/AccessibilityScript', () => ({
    AccessibilityScript: () => <script data-testid="a11y-script" />
}));

vi.mock('@/components/shared/NewRelicScript', () => ({
    NewRelicScript: () => <script data-testid="nr-script" />
}));

vi.mock('@/components/shared/WorkInProgressBanner', () => ({
    WorkInProgressBanner: () => <div data-testid="wip-banner" />
}));

// Mock globals.css import
vi.mock('@/app/globals.css', () => ({}));

describe('RootLayout', () => {
    it('renders the main content wrapper with correct ID', () => {
        // RootLayout renders <html> and <body>. In a JSDOM environment, we cannot nest <html> inside the test container <div>.
        // We must inspect the children directly or use a different rendering strategy.
        // Or, we can mock the internal components and check the structure.

        // Since we want to verify the <main> wrapper, let's render the children of body.

        const result = RootLayout({
            children: <div data-testid="child-content">Content</div>
        });

        // result is a React Element (<html>...</html>)
        // We can render this into a document using render() if we use container: document
        // But cleaning up is hard.

        // Alternatively, we can traverse the React Element tree.
        const html = result as React.ReactElement;
        const body = html.props.children[1]; // <head> is 0, <body> is 1
        const providers = body.props.children;
        const a11yProvider = providers.props.children;
        // Children of AccessibilityProvider: [WorkInProgressBanner, SkipToContent, main, SpeedInsights, Analytics]
        const childrenArray = a11yProvider.props.children;
        const main = childrenArray[2];

        expect(main.type).toBe('main');
        expect(main.props.id).toBe('main-content');
        expect(main.props.className).toContain('min-h-screen');
    });
});
