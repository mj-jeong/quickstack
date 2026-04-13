/**
 * Snapshot tests for README.md and DECISIONS.md rendering.
 *
 * Uses Vitest's `toMatchFileSnapshot` so the expected output lives on disk
 * in tests/__snapshots__/ — easier to review diffs than inline snapshots.
 *
 * First run generates the snapshots; subsequent runs compare against them.
 * Update with: `pnpm test:integration -u` (or `-- --update`).
 */

import { describe, expect, it } from "vitest";
import type { ProjectContext } from "../../src/core/context.js";
import { renderDecisions } from "../../src/generators/decisions.js";
import { renderReadme } from "../../src/generators/readme.js";

const minimalContext: ProjectContext = {
	projectName: "minimal-app",
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

const fullContext: ProjectContext = {
	projectName: "full-app",
	framework: "nextjs",
	packageManager: "pnpm",
	preset: "recommended",
	styling: ["tailwind", "shadcn", "framer-motion"],
	utilities: ["zod", "date-fns", "ts-pattern", "es-toolkit"],
	stateForm: ["zustand", "react-hook-form"],
	auth: [],
	database: ["supabase"],
	dryRun: false,
};

describe("renderReadme file snapshots", () => {
	it("matches minimal context snapshot", async () => {
		const out = renderReadme(minimalContext);
		await expect(out).toMatchFileSnapshot("../__snapshots__/readme-minimal.md");
	});

	it("matches full context snapshot", async () => {
		const out = renderReadme(fullContext);
		await expect(out).toMatchFileSnapshot("../__snapshots__/readme-full.md");
	});
});

describe("renderDecisions file snapshots", () => {
	it("matches minimal context snapshot", async () => {
		const out = renderDecisions(minimalContext);
		await expect(out).toMatchFileSnapshot("../__snapshots__/decisions-minimal.md");
	});

	it("matches full context snapshot", async () => {
		const out = renderDecisions(fullContext);
		await expect(out).toMatchFileSnapshot("../__snapshots__/decisions-full.md");
	});
});
