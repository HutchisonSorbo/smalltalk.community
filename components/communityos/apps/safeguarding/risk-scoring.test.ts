import { describe, test, expect } from "vitest";
import { getRiskLevel } from "./risk-matrix";

describe("Risk Matrix Logic", () => {
    test("calculates Low risk correctly", () => {
        expect(getRiskLevel(1, 1)).toBe("low");
        expect(getRiskLevel(2, 2)).toBe("low");
        expect(getRiskLevel(1, 5)).toBe("low");
    });

    test("calculates Medium risk correctly", () => {
        expect(getRiskLevel(2, 3)).toBe("medium");
        expect(getRiskLevel(3, 3)).toBe("medium");
        expect(getRiskLevel(5, 2)).toBe("medium");
    });

    test("calculates High risk correctly", () => {
        expect(getRiskLevel(3, 4)).toBe("high");
        expect(getRiskLevel(4, 4)).toBe("high");
        expect(getRiskLevel(4, 3)).toBe("high");
    });

    test("calculates Extreme risk correctly", () => {
        expect(getRiskLevel(4, 5)).toBe("extreme");
        expect(getRiskLevel(5, 4)).toBe("extreme");
        expect(getRiskLevel(5, 5)).toBe("extreme");
    });

    test("handles edge cases", () => {
        // 5 * 1 = 5 (Low)
        expect(getRiskLevel(5, 1)).toBe("low");
        // 1 * 5 = 5 (Low)
        expect(getRiskLevel(1, 5)).toBe("low");
        // 2 * 3 = 6 (Medium)
        expect(getRiskLevel(2, 3)).toBe("medium");
        // 3 * 4 = 12 (High)
        expect(getRiskLevel(3, 4)).toBe("high");
        // 4 * 5 = 20 (Extreme)
        expect(getRiskLevel(4, 5)).toBe("extreme");
    });
});
