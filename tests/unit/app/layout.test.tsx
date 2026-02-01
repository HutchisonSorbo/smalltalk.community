
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
        // RootLayout is an async server component, but for unit testing React structure
        // in this environment (without Next.js RSC runner), we can treat it as a function
        // if we mock the async parts or if it doesn't await anything before return.
        // Looking at the file, it is synchronous (export default function ...).
        // Wait, the file has "export default function RootLayout". It is not async.

        const { container } = render(
            <RootLayout>
                <div data-testid="child-content">Content</div>
            </RootLayout>
        );

        // Check for SkipToContent
        expect(screen.getByTestId('skip-link')).toBeInTheDocument();

        // Check for Main Wrapper
        // We look for a <main> tag with id="main-content"
        const main = container.querySelector('main#main-content');
        expect(main).toBeInTheDocument();
        expect(main).toHaveClass('min-h-screen');
        expect(main).toContainHTML('<div data-testid="child-content">Content</div>');
    });
});
