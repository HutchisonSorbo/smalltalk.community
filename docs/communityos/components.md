# CommunityOS Component Library

CommunityOS V2 uses a set of premium, accessible, and unified UI components.

## Core UI Components

### `COSModal`

A responsive, accessible modal component with standard header, body, and footer sections.

- **Path**: `components/communityos/ui/cos-modal.tsx`
- **Features**: Keyboard support, focus trapping, backdrop blur.

### `COSKanban`

A drag-and-drop kanban board for managing pipelines and stages.

- **Path**: `components/communityos/ui/cos-kanban.tsx`
- **Apps**: CRM (Pipeline), Project Management.

### `COSSearch`

A unified search input with loading states and clear buttons.

- **Path**: `components/communityos/ui/cos-search.tsx`

### `COSFilterBar`

A horizontal filter bar with active state badges and "Clear All" functionality.

- **Path**: `components/communityos/ui/cos-filter-bar.tsx`

### `COSBulkActions`

A floating action bar that appears when items are selected.

- **Path**: `components/communityos/ui/cos-bulk-actions.tsx`
- **Features**: "Selected Count" indicator, batch delete/edit.

### `COSSwipeActions`

Mobile-optimised swipe gestures for list items.

- **Path**: `components/communityos/ui/cos-swipe-actions.tsx`

## Application-Specific Components

- **BarcodeScanner**: QR/Barcode scanning for inventory.
- **FlowBuilder**: Visual editor for workflow automation.
- **AvailabilityGrid**: High-performance grid for volunteer rostering.
- **KPIBuilder**: Visual metric constructor for impact reporting.
