import { describe, expect, it } from "vitest";
import { buildCnaArgs } from "../../src/adapters/next/options.js";
import type { ProjectContext } from "../../src/core/context.js";

function makeCtx(overrides: Partial<ProjectContext> = {}): ProjectContext {
	return {
		projectName: "my-app",
		framework: "nextjs",
		packageManager: "pnpm",
		preset: "minimal",
		styling: [],
		utilities: [],
		stateForm: [],
		dryRun: false,
		...overrides,
	};
}

describe("buildCnaArgs", () => {
	it("always includes --ts, --src-dir, --app, --eslint, --import-alias @/*", () => {
		const args = buildCnaArgs(makeCtx());
		expect(args).toContain("--ts");
		expect(args).toContain("--src-dir");
		expect(args).toContain("--app");
		expect(args).toContain("--eslint");
		expect(args).toContain("--import-alias");
		expect(args).toContain("@/*");
	});

	it("includes project name as first argument", () => {
		const args = buildCnaArgs(makeCtx({ projectName: "cool-project" }));
		expect(args[0]).toBe("cool-project");
	});

	it("includes --no-tailwind when no styling is selected", () => {
		const args = buildCnaArgs(makeCtx({ styling: [] }));
		expect(args).toContain("--no-tailwind");
		expect(args).not.toContain("--tailwind");
	});

	it("includes --tailwind when tailwind is selected", () => {
		const args = buildCnaArgs(makeCtx({ styling: ["tailwind"] }));
		expect(args).toContain("--tailwind");
		expect(args).not.toContain("--no-tailwind");
	});

	it("includes --tailwind when shadcn is selected (resolveImplicitDeps already applied)", () => {
		// resolveImplicitDeps ensures tailwind is in styling when shadcn is selected
		const args = buildCnaArgs(makeCtx({ styling: ["tailwind", "shadcn"] }));
		expect(args).toContain("--tailwind");
		expect(args).not.toContain("--no-tailwind");
	});

	it("includes --tailwind when only shadcn is in styling array", () => {
		// Edge case: shadcn without tailwind in styling array still triggers --tailwind
		const args = buildCnaArgs(makeCtx({ styling: ["shadcn"] }));
		expect(args).toContain("--tailwind");
		expect(args).not.toContain("--no-tailwind");
	});

	it("includes --use-pnpm for pnpm package manager", () => {
		const args = buildCnaArgs(makeCtx({ packageManager: "pnpm" }));
		expect(args).toContain("--use-pnpm");
	});

	it("includes --use-npm for npm package manager", () => {
		const args = buildCnaArgs(makeCtx({ packageManager: "npm" }));
		expect(args).toContain("--use-npm");
	});

	it("includes --use-yarn for yarn package manager", () => {
		const args = buildCnaArgs(makeCtx({ packageManager: "yarn" }));
		expect(args).toContain("--use-yarn");
	});

	it("includes --turbopack for minimal preset (turbopack: true)", () => {
		const args = buildCnaArgs(makeCtx({ preset: "minimal" }));
		expect(args).toContain("--turbopack");
	});

	it("includes --turbopack for recommended preset (turbopack: true)", () => {
		const args = buildCnaArgs(makeCtx({ preset: "recommended" }));
		expect(args).toContain("--turbopack");
	});
});
