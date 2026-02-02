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

### `BarcodeScanner`

QR and Barcode scanning utility for inventory and asset management.

- **Path**: `components/communityos/apps/inventory/barcode-scanner.tsx`
- **Features**: Multi-format support (EAN, QR), camera toggle, low-light compensation.
- **API**: `onScan(data: string)` callback, `active` boolean prop.

### `FlowBuilder`

Visual editor for constructing and managing workflow automation.

- **Path**: `components/communityos/apps/workflow/flow-builder.tsx`
- **Features**: Drag-and-drop nodes, edge validation, auto-layout.
- **Integration**: Exports JSON configurations compatible with the automation engine.

### `AvailabilityGrid`

High-performance, virtualised grid for volunteer availability and rostering.

- **Path**: `components/communityos/apps/rostering/availability-grid.tsx`
- **Features**: Canvas-based rendering, multi-select gestures, real-time conflict detection.
- **Performance**: Handles thousands of cells with zero lag via virtualization.

### `KPIBuilder`

Metric constructor for dynamic impact tracking and reporting.

- **Path**: `components/communityos/apps/impact/kpi-builder.tsx`
- **Features**: Formula builder, data source selector, preview charts.
- **Usage**: Used in the Impact App to define bespoke success metrics.
