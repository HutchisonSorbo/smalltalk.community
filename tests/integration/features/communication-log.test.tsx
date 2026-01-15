// tests/integration/features/communication-log.test.tsx
import { render, screen } from '@testing-library/react';
import { CommunicationLog } from '@/components/communityos/communication-log';
import { describe, it, expect } from 'vitest';

describe('Communication Log Feature', () => {
    const mockLogs = [
        { id: '1', type: 'Email', subject: 'Welcome', status: 'Sent' as const, date: '2026-01-10' },
        { id: '2', type: 'SMS', subject: 'Reminder', status: 'Draft' as const, date: '2026-01-12' },
    ];

    it('filters and displays logs correctly', () => {
        render(<CommunicationLog logs={mockLogs} />);

        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
        expect(screen.getByText(/reminder/i)).toBeInTheDocument();
    });

    it('shows correct status badges', () => {
        render(<CommunicationLog logs={mockLogs} />);

        expect(screen.getByText('Sent')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });
});
