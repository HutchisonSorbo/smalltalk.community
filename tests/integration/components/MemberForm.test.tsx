// tests/integration/components/MemberForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from '@/components/communityos/MemberForm';
import { describe, it, expect, vi } from 'vitest';

describe('MemberForm Integration', () => {
    it('validates required fields before submission', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<MemberForm onSubmit={onSubmit} />);

        await user.click(screen.getByText(/save member/i));

        expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/last name is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/invalid email|email is required/i)).toBeInTheDocument();
    });

    it('submits correctly with valid data', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<MemberForm onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText(/first name/i), 'John');
        await user.type(screen.getByLabelText(/last name/i), 'Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');

        await user.click(screen.getByText(/save member/i));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            }, expect.anything());
        });
    });
});
