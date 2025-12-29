"use client";

import React from "react";

/**
 * AccessibilityScript
 * 
 * This inline script runs immediately in the <head> to restore accessibility settings
 * (high contrast, font size, etc.) from localStorage before hydration to prevent flash of wrong style.
 * 
 * Logic must match AccessibilityContext.tsx behavior.
 */
export function AccessibilityScript() {
    return (
        <script
            id="accessibility-script"
            dangerouslySetInnerHTML={{
                __html: `
            (function() {
                try {
                    var saved = localStorage.getItem("accessibility-settings");
                    if (saved) {
                        var s = JSON.parse(saved);
                        var h = document.documentElement;
                        if (s.highContrast) h.setAttribute("data-high-contrast", "true");
                        if (s.dyslexiaFont) h.setAttribute("data-dyslexia-font", "true");
                        h.setAttribute("data-text-scale", s.textScale || 1);
                        h.style.setProperty("--font-size-scale", s.textScale || 1);
                        h.setAttribute("data-line-spacing", s.lineSpacing || 1.5);
                        h.style.setProperty("--line-height-scale", s.lineSpacing || 1.5);
                        if (s.saturation) h.setAttribute("data-saturation", s.saturation);
                        if (s.linkHighlight) h.setAttribute("data-link-highlight", "true");
                    }
                } catch (e) {}
            })();
            `
            }}
        />
    );
}

// CodeRabbit Audit Trigger
