import { create } from "zustand";

interface DittoState {
    isSyncing: boolean;
    pendingChanges: number;
    localOnline: boolean;
    dittoOnline: boolean;
    isInitialized: boolean;

    // Actions
    setSyncing: (isSyncing: boolean) => void;
    setPendingChanges: (count: number) => void;
    incrementPendingChanges: () => void;
    decrementPendingChanges: () => void;
    setLocalOnline: (isOnline: boolean) => void;
    setDittoOnline: (isOnline: boolean) => void;
    setInitialized: (isInitialized: boolean) => void;
}

export const useDittoStore = create<DittoState>((set) => ({
    isSyncing: false,
    pendingChanges: 0,
    localOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    dittoOnline: true,
    isInitialized: false,

    setSyncing: (isSyncing) => set({ isSyncing }),
    setPendingChanges: (pendingChanges) => set({ pendingChanges }),
    incrementPendingChanges: () => set((state) => ({ pendingChanges: state.pendingChanges + 1 })),
    decrementPendingChanges: () => set((state) => ({
        pendingChanges: Math.max(0, state.pendingChanges - 1)
    })),
    setLocalOnline: (localOnline) => set({ localOnline }),
    setDittoOnline: (dittoOnline) => set({ dittoOnline }),
    setInitialized: (isInitialized) => set({ isInitialized }),
}));
