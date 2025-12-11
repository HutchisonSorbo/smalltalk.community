"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AccessibilityState = {
    highContrast: boolean;
    dyslexiaFont: boolean;
    textScale: number;
    lineSpacing: number;
    saturation: "standard" | "low" | "monochrome";
    linkHighlight: boolean;
    stopAnimations: boolean;
    cursorSize: "normal" | "large";
};

type AccessibilityContextType = AccessibilityState & {
    setHighContrast: (v: boolean) => void;
    setDyslexiaFont: (v: boolean) => void;
    setTextScale: (v: number) => void;
    setLineSpacing: (v: number) => void;
    setSaturation: (v: AccessibilityState["saturation"]) => void;
    setLinkHighlight: (v: boolean) => void;
    setStopAnimations: (v: boolean) => void;
    setCursorSize: (v: AccessibilityState["cursorSize"]) => void;
    resetDefaults: () => void;
};

const defaultState: AccessibilityState = {
    highContrast: false,
    dyslexiaFont: false,
    textScale: 1,
    lineSpacing: 1.5,
    saturation: "standard",
    linkHighlight: false,
    stopAnimations: false,
    cursorSize: "normal",
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AccessibilityState>(defaultState);
    const [mounted, setMounted] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("accessibility-settings");
        if (saved) {
            try {
                setState({ ...defaultState, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse accessibility settings", e);
            }
        }
    }, []);

    // Sync to localStorage and DOM
    useEffect(() => {
        if (!mounted) return;

        localStorage.setItem("accessibility-settings", JSON.stringify(state));

        const html = document.documentElement;

        // Apply attributes
        state.highContrast ? html.setAttribute("data-high-contrast", "true") : html.removeAttribute("data-high-contrast");
        state.dyslexiaFont ? html.setAttribute("data-dyslexia-font", "true") : html.removeAttribute("data-dyslexia-font");
        html.setAttribute("data-text-scale", state.textScale.toString());
        html.setAttribute("data-line-spacing", state.lineSpacing.toString());
        html.setAttribute("data-saturation", state.saturation);
        state.linkHighlight ? html.setAttribute("data-link-highlight", "true") : html.removeAttribute("data-link-highlight");
        state.stopAnimations ? html.setAttribute("data-stop-animations", "true") : html.removeAttribute("data-stop-animations");
        html.setAttribute("data-cursor-size", state.cursorSize);

        // CSS Variable Overrides for Scaling
        html.style.setProperty("--font-size-scale", state.textScale.toString());
        html.style.setProperty("--line-height-scale", state.lineSpacing.toString());

    }, [state, mounted]);

    const updateState = (key: keyof AccessibilityState, value: any) => {
        setState((prev) => ({ ...prev, [key]: value }));
    };

    const resetDefaults = () => setState(defaultState);

    return (
        <AccessibilityContext.Provider
            value={{
                ...state,
                setHighContrast: (v) => updateState("highContrast", v),
                setDyslexiaFont: (v) => updateState("dyslexiaFont", v),
                setTextScale: (v) => updateState("textScale", v),
                setLineSpacing: (v) => updateState("lineSpacing", v),
                setSaturation: (v) => updateState("saturation", v),
                setLinkHighlight: (v) => updateState("linkHighlight", v),
                setStopAnimations: (v) => updateState("stopAnimations", v),
                setCursorSize: (v) => updateState("cursorSize", v),
                resetDefaults,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
}
