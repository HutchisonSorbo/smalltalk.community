// tests/integration/components/member-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemberForm } from '@/components/communityos/member-form';
import { describe, it, expect, vi } from 'vitest';

describe('MemberForm Integration', () => {
    it('validates required fields before submission', async () => {
        const onSubmit = vi.fn();
        render(<MemberForm onSubmit={onSubmit} />);

        fireEvent.click(screen.getByText(/save member/i));

        expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    });

    it('submits correctly with valid data', async () => {
        const onSubmit = vi.fn();
        render(<MemberForm onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });

        fireEvent.click(screen.getByText(/save member/i));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });
});
