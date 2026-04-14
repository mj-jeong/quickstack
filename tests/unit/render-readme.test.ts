import { describe, expect, it } from "vitest";
import type { ProjectContext } from "../../src/core/context.js";
import { renderReadme } from "../../src/generators/readme.js";

const baseCtx: ProjectContext = {
	projectName: "my-app",
	setupMode: "new-directory",
	framework: "nextjs",
	packageManager: "pnpm",
	preset: "minimal",
	styling: [],
	utilities: [],
	stateForm: [],
	auth: [],
	database: [],
	dryRun: false,
};

describe("renderReadme", () => {
	it("includes the project name as title", () => {
		const result = renderReadme({ ...baseCtx, projectName: "awesome-project" });
		expect(result).toContain("# awesome-project");
	});

	it("includes pnpm dev command when packageManager is pnpm", () => {
		const result = renderReadme({ ...baseCtx, packageManager: "pnpm" });
		expect(result).toContain("pnpm dev");
	});

	it("includes npm run dev command when packageManager is npm", () => {
		const result = renderReadme({ ...baseCtx, packageManager: "npm" });
		expect(result).toContain("npm run dev");
	});

	it("includes yarn dev command when packageManager is yarn", () => {
		const result = renderReadme({ ...baseCtx, packageManager: "yarn" });
		expect(result).toContain("yarn dev");
	});

	it("includes both tailwind and shadcn in Tech Stack when both are selected", () => {
		const result = renderReadme({
			...baseCtx,
			styling: ["tailwind", "shadcn"],
		});
		expect(result).toContain("tailwind");
		expect(result).toContain("shadcn");
	});

	it('shows "No additional libraries" when no libraries are selected', () => {
		const result = renderReadme({ ...baseCtx, styling: [], utilities: [], stateForm: [] });
		expect(result).toContain("No additional libraries");
	});

	it("includes directory structure description for recommended preset", () => {
		const result = renderReadme({ ...baseCtx, preset: "recommended" });
		expect(result).toContain("components/");
		expect(result).toContain("features/");
		expect(result).toContain("lib/");
		expect(result).toContain("hooks/");
	});

	it("does not include extended directory structure for minimal preset", () => {
		const result = renderReadme({ ...baseCtx, preset: "minimal" });
		expect(result).not.toContain("components/");
		expect(result).not.toContain("features/");
	});

	it("includes npm install step for npm packageManager", () => {
		const result = renderReadme({ ...baseCtx, packageManager: "npm" });
		expect(result).toContain("npm install");
	});

	it("does not include install step for pnpm (already installed)", () => {
		const result = renderReadme({ ...baseCtx, packageManager: "pnpm" });
		expect(result).not.toContain("pnpm install");
	});

	it("includes Auth section when auth contains next-auth", () => {
		const result = renderReadme({ ...baseCtx, auth: ["next-auth"] });
		expect(result).toContain("### Auth");
		expect(result).toContain("next-auth");
	});

	it("includes Database section when database contains prisma and supabase", () => {
		const result = renderReadme({ ...baseCtx, database: ["prisma", "supabase"] });
		expect(result).toContain("### Database");
		expect(result).toContain("prisma");
		expect(result).toContain("supabase");
	});

	it("does not include Auth or Database sections when both are empty", () => {
		const result = renderReadme({ ...baseCtx, auth: [], database: [] });
		expect(result).not.toContain("### Auth");
		expect(result).not.toContain("### Database");
	});
});
