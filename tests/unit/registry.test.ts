import { describe, expect, it } from "vitest";
import { ValidationError } from "../../src/core/errors.js";
import {
	detectConflicts,
	registerIntegration,
	resolveExecutionOrder,
} from "../../src/integrations/registry.js";
import type { Integration } from "../../src/integrations/types.js";

function makeIntegration(id: string, overrides: Partial<Integration> = {}): Integration {
	return {
		id,
		name: id,
		group: "utilities",
		packages: [],
		setup: async () => {},
		...overrides,
	};
}

// Reset registry between tests by re-importing fresh module is not ideal in ESM,
// so instead we register unique IDs per test suite.

describe("resolveExecutionOrder", () => {
	it("returns empty array for empty input", () => {
		expect(resolveExecutionOrder([])).toEqual([]);
	});

	it("preserves registration order for integrations with no dependencies", () => {
		registerIntegration(makeIntegration("alpha"));
		registerIntegration(makeIntegration("beta"));
		const result = resolveExecutionOrder(["alpha", "beta"]);
		expect(result).toEqual(["alpha", "beta"]);
	});

	it("places dependency before dependent (A requires B → B before A)", () => {
		registerIntegration(makeIntegration("dep-b"));
		registerIntegration(makeIntegration("dep-a", { requires: ["dep-b"] }));
		const result = resolveExecutionOrder(["dep-a", "dep-b"]);
		expect(result.indexOf("dep-b")).toBeLessThan(result.indexOf("dep-a"));
	});

	it("resolves A→B→C chain: C first, then B, then A", () => {
		registerIntegration(makeIntegration("chain-c"));
		registerIntegration(makeIntegration("chain-b", { requires: ["chain-c"] }));
		registerIntegration(makeIntegration("chain-a", { requires: ["chain-b"] }));
		const result = resolveExecutionOrder(["chain-a", "chain-b", "chain-c"]);
		expect(result.indexOf("chain-c")).toBeLessThan(result.indexOf("chain-b"));
		expect(result.indexOf("chain-b")).toBeLessThan(result.indexOf("chain-a"));
	});

	it("throws ValidationError on circular dependency (A→B→A)", () => {
		registerIntegration(makeIntegration("cycle-a", { requires: ["cycle-b"] }));
		registerIntegration(makeIntegration("cycle-b", { requires: ["cycle-a"] }));
		expect(() => resolveExecutionOrder(["cycle-a", "cycle-b"])).toThrow(ValidationError);
	});
});

describe("detectConflicts", () => {
	it("returns empty array for empty input", () => {
		expect(detectConflicts([])).toEqual([]);
	});

	it("detects conflict when two unrelated integrations modify the same file", () => {
		registerIntegration(makeIntegration("conflict-x", { modifies: ["tailwind.config.ts"] }));
		registerIntegration(makeIntegration("conflict-y", { modifies: ["tailwind.config.ts"] }));
		const result = detectConflicts(["conflict-x", "conflict-y"]);
		expect(result).toHaveLength(1);
		expect(result[0].file).toBe("tailwind.config.ts");
		expect(result[0].integrations).toContain("conflict-x");
		expect(result[0].integrations).toContain("conflict-y");
	});

	it("does not flag conflict when one integration requires the other (order guaranteed)", () => {
		registerIntegration(makeIntegration("ordered-base", { modifies: ["next.config.ts"] }));
		registerIntegration(
			makeIntegration("ordered-ext", {
				requires: ["ordered-base"],
				modifies: ["next.config.ts"],
			}),
		);
		const result = detectConflicts(["ordered-base", "ordered-ext"]);
		expect(result).toHaveLength(0);
	});
});
