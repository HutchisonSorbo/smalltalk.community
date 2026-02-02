# Developer Guide: Adding New Apps

This guide explains how to add new applications to the CommunityOS V2 platform.

## 1. Define the App Configuration

All apps must be registered in `components/communityos/apps-config.ts`.

```typescript
{
  id: "new-app",
  name: "My New App",
  icon: "🚀",
  description: "Description of the app",
  category: "operations",
  itemType: "Item" // Singular name of items
}
```

## 2. Choose the Implementation Pattern

### Pattern A: Generic App (Tiers 2-4)

Use this for standard CRUD apps. You only need to define the `fields` in `apps-config.ts`.

```typescript
fields: [
  { id: "date", label: "Date", type: "date" },
  { id: "category", label: "Category", type: "select", options: [...] }
]
```

### Pattern B: Specialized App (Tier 1)

Use this for complex workflows with custom UI.

1. Create a new directory in `components/communityos/apps/new-app/`.
2. Implement your main component (e.g., `NewApp.tsx`).
3. Update `components/communityos/AppContentLoader.tsx` to dynamically import and render your new component.

## 3. Data Sync with Ditto

Use the `useDittoSync` hook for real-time, offline-first data.

```typescript
const { items, upsertDocument, deleteDocument } = useDittoSync<MyItemType>("new-app-collection");
```

## 4. Verification

- Ensure `npm run check` passes.
- Test in mobile viewports.
- Verify presence in the App Launcher.
