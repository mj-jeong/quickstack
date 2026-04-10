import { describe, expect, it } from "vitest";
import { resolveImplicitDeps } from "../../src/prompts/index.js";

describe("resolveImplicitDeps", () => {
	it("adds tailwind automatically when shadcn is selected and tailwind is not", () => {
		const result = resolveImplicitDeps({
			styling: ["shadcn"],
			utilities: [],
			stateForm: [],
		});
		expect(result.styling).toContain("tailwind");
		expect(result.styling).toContain("shadcn");
	});

	it("does not duplicate tailwind when shadcn and tailwind are both selected", () => {
		const result = resolveImplicitDeps({
			styling: ["tailwind", "shadcn"],
			utilities: [],
			stateForm: [],
		});
		const tailwindCount = result.styling.filter((s) => s === "tailwind").length;
		expect(tailwindCount).toBe(1);
		expect(result.styling).toContain("shadcn");
	});

	it("does not modify styling when shadcn is not selected", () => {
		const input = { styling: ["tailwind", "framer-motion"], utilities: [], stateForm: [] };
		const result = resolveImplicitDeps(input);
		expect(result.styling).toEqual(["tailwind", "framer-motion"]);
	});

	it("returns unchanged result for empty arrays", () => {
		const result = resolveImplicitDeps({ styling: [], utilities: [], stateForm: [] });
		expect(result.styling).toEqual([]);
		expect(result.utilities).toEqual([]);
		expect(result.stateForm).toEqual([]);
	});

	it("does not mutate utilities or stateForm when only styling changes", () => {
		const result = resolveImplicitDeps({
			styling: ["shadcn"],
			utilities: ["zod", "date-fns"],
			stateForm: ["zustand"],
		});
		expect(result.utilities).toEqual(["zod", "date-fns"]);
		expect(result.stateForm).toEqual(["zustand"]);
	});
});
