import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";

const eslintConfig = [
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "coverage/**",
            "Archive/**",
            "Organisational Development/**",
            "**/*.config.js",
            "**/*.config.mjs",
            "drizzle.config.ts",
        ],
    },
    ...nextConfig,
    ...tseslint.configs.recommended,
    {
        rules: {
            // Allow unused variables starting with underscore
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            // Allow explicit any for complex typing scenarios
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];

export default eslintConfig;
