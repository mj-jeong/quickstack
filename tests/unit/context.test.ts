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
	auth: [],
	database: [],
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
			stateForm: ["zustand", "react-hook-form"],
			auth: ["next-auth"],
			database: ["prisma"],
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

	it("parses styling with lucide-react", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			styling: ["lucide-react"],
		});
		expect(result.success).toBe(true);
	});

	it("fails on stateForm with supabase (supabase removed from stateForm)", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			stateForm: ["supabase"],
		});
		expect(result.success).toBe(false);
	});

	it("parses auth with next-auth", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			auth: ["next-auth"],
		});
		expect(result.success).toBe(true);
	});

	it("parses auth with empty array", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			auth: [],
		});
		expect(result.success).toBe(true);
	});

	it("fails on auth with invalid value", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			auth: ["clerk"],
		});
		expect(result.success).toBe(false);
	});

	it("parses database with prisma", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			database: ["prisma"],
		});
		expect(result.success).toBe(true);
	});

	it("parses database with drizzle and supabase", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			database: ["drizzle", "supabase"],
		});
		expect(result.success).toBe(true);
	});

	it("fails on database with invalid value", () => {
		const result = ProjectContextSchema.safeParse({
			...validMinimal,
			database: ["mongodb"],
		});
		expect(result.success).toBe(false);
	});
});
