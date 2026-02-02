import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { GenericCommunityApp } from '@/components/communityos/apps/GenericCommunityApp';
import * as TenantProvider from '@/components/communityos/TenantProvider';
import * as DittoSync from '@/hooks/useDittoSync';
import { communityOSApps } from '@/components/communityos/apps-config';

// Mock the hooks
vi.mock('@/components/communityos/TenantProvider', () => ({
    useTenant: vi.fn(),
}));

vi.mock('@/hooks/useDittoSync', () => ({
    useDittoSync: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

import { toast } from 'sonner';

describe('CommunityOS Integration Tests', () => {
    const mockTenant = { id: 'tenant-1', name: 'Test Org' };
    const mockUpsert = vi.fn();
    const mockDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (TenantProvider.useTenant as any).mockReturnValue({ tenant: mockTenant });
        (DittoSync.useDittoSync as any).mockReturnValue({
            documents: [],
            isLoading: false,
            upsertDocument: mockUpsert,
            deleteDocument: mockDelete,
            isOnline: true,
        });
    });

    it('renders GenericCommunityApp and handles dynamic fields', async () => {
        render(
            <GenericCommunityApp
                appId="events"
                title="Events & Programs"
                description="Manage events"
                placeholder="No events"
                itemType="Event"
            />
        );

        // Check if title is rendered
        expect(screen.getByText('Events & Programs')).toBeDefined();

        // Click "Add Event"
        const addBtn = screen.getByText('Add Event');
        fireEvent.click(addBtn);

        // Check for common fields
        expect(screen.getByLabelText(/Title/i)).toBeDefined();

        // Check for specific dynamic fields from apps-config.ts
        expect(screen.getByLabelText(/Event Date/i)).toBeDefined();
        expect(screen.getByLabelText(/Location/i)).toBeDefined();
        expect(screen.getByLabelText(/Capacity/i)).toBeDefined();

        // Fill out fields
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Annual Gala' } });
        fireEvent.change(screen.getByLabelText(/Event Date/i), { target: { value: '2026-02-14' } });
        fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Main Hall' } });
        fireEvent.change(screen.getByLabelText(/Capacity/i), { target: { value: '100' } });

        // Save
        const saveBtn = screen.getByText('Save Event');
        fireEvent.click(saveBtn);

        // Verify upsert was called with metadata
        await waitFor(() => {
            expect(mockUpsert).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    title: 'Annual Gala',
                    metadata: expect.objectContaining({
                        location: 'Main Hall',
                        capacity: '100'
                    })
                })
            );
        });

        // Verify toast success was called
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Event saved'));
        });
    });

    it('handles upsert failure gracefully', async () => {
        mockUpsert.mockRejectedValueOnce(new Error('upsert failed'));

        render(
            <GenericCommunityApp
                appId="events"
                title="Community Events"
                description="Manage events"
                placeholder="Search events..."
                itemType="Event"
            />
        );

        // Open modal
        const addBtn = screen.getByRole('button', { name: /Add Event/i });
        fireEvent.click(addBtn);

        // Fill required fields
        const titleInput = screen.getByPlaceholderText(/e.g. Event Name/i);
        fireEvent.change(titleInput, { target: { value: 'New Event' } });

        const dateInput = screen.getByLabelText(/Event Date/i);
        fireEvent.change(dateInput, { target: { value: '2026-03-01' } });

        // Click Save
        const saveBtn = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveBtn);

        // Verify upsert was attempted
        await waitFor(() => {
            expect(mockUpsert).toHaveBeenCalled();
        });

        // Verify toast error was called
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });

    it('handles search and filtering correctly', async () => {
        const mockItems = [
            { id: '1', title: 'Draft Event', description: 'Desc 1', status: 'Draft', createdAt: new Date().toISOString() },
            { id: '2', title: 'Active Promo', description: 'Desc 2', status: 'Active', createdAt: new Date().toISOString() },
        ];

        (DittoSync.useDittoSync as any).mockReturnValue({
            documents: mockItems,
            isLoading: false,
            upsertDocument: mockUpsert,
            deleteDocument: mockDelete,
            isOnline: true,
        });

        render(
            <GenericCommunityApp
                appId="events"
                title="Events"
                description="Desc"
                placeholder="Empty"
                itemType="Event"
            />
        );

        // Initially both labels visible
        expect(screen.getByText('Draft Event')).toBeDefined();
        expect(screen.getByText('Active Promo')).toBeDefined();

        // Search for "Draft"
        const searchInput = screen.getByPlaceholderText(/Search/i);
        fireEvent.change(searchInput, { target: { value: 'Draft' } });

        await waitFor(() => {
            expect(screen.getByText('Draft Event')).toBeDefined();
            expect(screen.queryByText('Active Promo')).toBeNull();
        }, { timeout: 1000 });
    });
});
