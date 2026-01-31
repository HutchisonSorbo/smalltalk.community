// types.ts - Design system type definitions
export interface SpacingTokens {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
}

export interface RadiusTokens {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
}

export interface FontSizeTokens {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
}

export interface DesignTokens {
    spacing: SpacingTokens;
    radius: RadiusTokens;
    fontSize: FontSizeTokens;
    touchTarget: {
        min: string;
        preferred: string;
    };
    animation: {
        fast: string;
        normal: string;
        slow: string;
    };
    shadow: {
        sm: string;
        md: string;
        lg: string;
        glass: string;
    };
}
