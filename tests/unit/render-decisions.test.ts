import { describe, expect, it } from "vitest";
import type { ProjectContext } from "../../src/core/context.js";
import { renderDecisions } from "../../src/generators/decisions.js";

const baseCtx: ProjectContext = {
	projectName: "my-app",
	framework: "nextjs",
	packageManager: "pnpm",
	preset: "minimal",
	styling: [],
	utilities: [],
	stateForm: [],
	dryRun: false,
};

describe("renderDecisions", () => {
	it("includes TypeScript with Official default source", () => {
		const result = renderDecisions(baseCtx);
		expect(result).toContain("TypeScript");
		expect(result).toContain("Official default");
	});

	it("includes App Router with Official default source", () => {
		const result = renderDecisions(baseCtx);
		expect(result).toContain("App Router");
		expect(result).toContain("Official default");
	});

	it("includes ESLint with Official default source", () => {
		const result = renderDecisions(baseCtx);
		expect(result).toContain("ESLint");
		expect(result).toContain("Official default");
	});

	it("includes tailwind with Community-common source when selected", () => {
		const result = renderDecisions({ ...baseCtx, styling: ["tailwind"] });
		expect(result).toContain("tailwind");
		expect(result).toContain("Community-common");
	});

	it("includes zustand with Community-common source when selected", () => {
		const result = renderDecisions({ ...baseCtx, stateForm: ["zustand"] });
		expect(result).toContain("zustand");
		expect(result).toContain("Community-common");
	});

	it("does not include tailwind when it is not selected", () => {
		const result = renderDecisions({ ...baseCtx, styling: [] });
		expect(result).not.toContain("tailwind");
	});

	it("does not include zustand when it is not selected", () => {
		const result = renderDecisions({ ...baseCtx, stateForm: [] });
		expect(result).not.toContain("zustand");
	});

	it("does not include react-hook-form when it is not selected", () => {
		const result = renderDecisions({ ...baseCtx, stateForm: [] });
		expect(result).not.toContain("react-hook-form");
	});

	it("includes directory structure entries with QuickStack opinion for recommended preset", () => {
		const result = renderDecisions({ ...baseCtx, preset: "recommended" });
		expect(result).toContain("QuickStack opinion");
		expect(result).toContain("src/components");
		expect(result).toContain("src/features");
	});

	it("does not include extended directory structure entries for minimal preset", () => {
		const result = renderDecisions({ ...baseCtx, preset: "minimal" });
		expect(result).not.toContain("src/components");
		expect(result).not.toContain("src/features");
	});

	it("every entry includes a reason (non-empty text after source tag)", () => {
		const result = renderDecisions({
			...baseCtx,
			styling: ["tailwind", "shadcn"],
			utilities: ["zod"],
			stateForm: ["zustand", "supabase"],
		});
		// Each line with a source tag should also have reason text
		const lines = result.split("\n").filter((l) => l.includes("[") && l.includes("]"));
		for (const line of lines) {
			const afterBracket = line.split("]")[1] ?? "";
			expect(afterBracket.trim().length).toBeGreaterThan(0);
		}
	});

	it("includes supabase with Community-common source when selected", () => {
		const result = renderDecisions({ ...baseCtx, stateForm: ["supabase"] });
		expect(result).toContain("supabase");
		expect(result).toContain("Community-common");
	});

	it("includes all selected utilities", () => {
		const result = renderDecisions({
			...baseCtx,
			utilities: ["zod", "date-fns", "ts-pattern", "es-toolkit"],
		});
		expect(result).toContain("zod");
		expect(result).toContain("date-fns");
		expect(result).toContain("ts-pattern");
		expect(result).toContain("es-toolkit");
	});
});
