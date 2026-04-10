import { describe, expect, it } from "vitest";
import { ProjectContextSchema } from "../../src/core/context.js";

const validMinimal = {
	projectName: "my-app",
	framework: "nextjs",
	packageManager: "pnpm",
	preset: "minimal",
	styling: [],
	utilities: [],
	stateForm: [],
};

describe("ProjectContextSchema", () => {
	it("parses valid minimal input", () => {
		const result = ProjectContextSchema.safeParse(validMinimal);
		expect(result.success).toBe(true);
	});

	it("parses valid full input with all fields", () => {
		const result = ProjectContextSchema.safeParse({
			projectName: "my-app",
			framework: "nextjs",
			packageManager: "npm",
			preset: "recommended",
			styling: ["tailwind", "shadcn", "framer-motion"],
			utilities: ["zod", "date-fns", "ts-pattern", "es-toolkit"],
			stateForm: ["zustand", "react-hook-form", "supabase"],
			dryRun: true,
		});
		expect(result.success).toBe(true);
	});

	it("defaults dryRun to false when not provided", () => {
		const result = ProjectContextSchema.safeParse(validMinimal);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.dryRun).toBe(false);
		}
	});

	it("fails on empty projectName", () => {
		const result = ProjectContextSchema.safeParse({ ...validMinimal, projectName: "" });
		expect(result.success).toBe(false);
	});

	it("fails on projectName with uppercase letters", () => {
		const result = ProjectContextSchema.safeParse({ ...validMinimal, projectName: "MyApp" });
		expect(result.success).toBe(false);
	});

	it("fails on projectName with special characters", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			projectName: "my_app!",
		});
		expect(result.success).toBe(false);
	});

	it("fails on invalid framework value", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			framework: "vue",
		});
		expect(result.success).toBe(false);
	});

	it("fails on invalid styling library", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			styling: ["bootstrap"],
		});
		expect(result.success).toBe(false);
	});
});
