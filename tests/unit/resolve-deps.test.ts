import { describe, expect, it } from "vitest";
import { resolveImplicitDeps } from "../../src/prompts/index.js";

describe("resolveImplicitDeps", () => {
	it("adds tailwind automatically when shadcn is selected and tailwind is not", () => {
		const result = resolveImplicitDeps({
			styling: ["shadcn"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		});
		expect(result.styling).toContain("tailwind");
		expect(result.styling).toContain("shadcn");
	});

	it("does not duplicate tailwind when shadcn and tailwind are both selected", () => {
		const result = resolveImplicitDeps({
			styling: ["tailwind", "shadcn"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		});
		const tailwindCount = result.styling.filter((s) => s === "tailwind").length;
		expect(tailwindCount).toBe(1);
		expect(result.styling).toContain("shadcn");
	});

	it("does not modify styling when shadcn is not selected", () => {
		const input = {
			styling: ["tailwind", "framer-motion"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		};
		const result = resolveImplicitDeps(input);
		expect(result.styling).toEqual(["tailwind", "framer-motion"]);
	});

	it("returns unchanged result for empty arrays", () => {
		const result = resolveImplicitDeps({
			styling: [],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		});
		expect(result.styling).toEqual([]);
		expect(result.utilities).toEqual([]);
		expect(result.stateForm).toEqual([]);
	});

	it("does not mutate utilities or stateForm when only styling changes", () => {
		const result = resolveImplicitDeps({
			styling: ["shadcn"],
			utilities: ["zod", "date-fns"],
			stateForm: ["zustand"],
			auth: [],
			database: [],
		});
		expect(result.utilities).toEqual(["zod", "date-fns"]);
		expect(result.stateForm).toEqual(["zustand"]);
	});

	// lucide-react 자동 포함 테스트
	it("adds lucide-react automatically when shadcn is selected and lucide-react is not", () => {
		const result = resolveImplicitDeps({
			styling: ["shadcn"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		});
		expect(result.styling).toContain("lucide-react");
		expect(result.styling).toContain("shadcn");
	});

	it("does not duplicate lucide-react when shadcn and lucide-react are both selected", () => {
		const result = resolveImplicitDeps({
			styling: ["tailwind", "shadcn", "lucide-react"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		});
		const lucideCount = result.styling.filter((s) => s === "lucide-react").length;
		expect(lucideCount).toBe(1);
	});

	it("does not add lucide-react when shadcn is not selected", () => {
		const result = resolveImplicitDeps({
			styling: ["tailwind", "framer-motion"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		});
		expect(result.styling).not.toContain("lucide-react");
	});

	it("adds both tailwind and lucide-react when shadcn is selected without either", () => {
		const result = resolveImplicitDeps({
			styling: ["shadcn"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
		});
		expect(result.styling).toContain("tailwind");
		expect(result.styling).toContain("lucide-react");
		expect(result.styling).toContain("shadcn");
	});

	it("passes auth and database through resolveImplicitDeps unchanged", () => {
		const result = resolveImplicitDeps({
			styling: [],
			utilities: [],
			stateForm: [],
			auth: ["next-auth"],
			database: ["prisma"],
		});
		expect(result.auth).toEqual(["next-auth"]);
		expect(result.database).toEqual(["prisma"]);
	});
});
