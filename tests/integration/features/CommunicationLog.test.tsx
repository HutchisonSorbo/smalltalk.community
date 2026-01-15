// tests/integration/features/CommunicationLog.test.tsx
import { render, screen } from '@testing-library/react';
import { CommunicationLog } from '@/components/communityos/CommunicationLog';
import { describe, it, expect } from 'vitest';

describe('Communication Log Feature', () => {
    const mockLogs = [
        { id: '1', type: 'Email', subject: 'Welcome', status: 'Sent' as const, date: '2026-01-10' },
        { id: '2', type: 'SMS', subject: 'Reminder', status: 'Draft' as const, date: '2026-01-12' },
    ];

    it('renders logs correctly', () => {
        render(<CommunicationLog logs={mockLogs} />);

        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
        expect(screen.getByText(/reminder/i)).toBeInTheDocument();
        expect(screen.getAllByTestId('log-item')).toHaveLength(2);
        expect(screen.getByText(/Email • 2026-01-10/)).toBeInTheDocument();
    });

    it('shows correct status badges', () => {
        render(<CommunicationLog logs={mockLogs} />);

        expect(screen.getByText('Sent')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('displays empty state message when no logs provided', () => {
        render(<CommunicationLog logs={[]} />);
        expect(screen.getByText(/no communication logs found/i)).toBeInTheDocument();
    });
});
