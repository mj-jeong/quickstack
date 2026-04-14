/**
 * E2E test — exercises the full pipeline with a real `create-next-app`
 * invocation. Requires network access, takes several minutes, and is
 * gated in CI to `main` branch only (see .github/workflows/ci.yml).
 *
 * Run locally with: `pnpm test:e2e`
 */

import { existsSync, mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ProjectContext } from "../../src/core/context.js";
import { runPipeline } from "../../src/core/pipeline.js";

// Only run when explicitly requested — avoids accidental downloads during
// local `pnpm test`.
const ENABLE_E2E = process.env.QUICKSTACK_E2E === "1" || process.env.CI === "true";

describe.skipIf(!ENABLE_E2E)("E2E: create command with real CNA", () => {
	let workDir: string;
	let originalCwd: string;

	beforeAll(() => {
		originalCwd = process.cwd();
		workDir = mkdtempSync(join(tmpdir(), "qs-e2e-"));
		process.chdir(workDir);
	});

	afterAll(async () => {
		process.chdir(originalCwd);
		await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
	});

	it("creates a working project with recommended preset + tailwind", async () => {
		const ctx: ProjectContext = {
			projectName: "e2e-app",
			setupMode: "new-directory",
			framework: "nextjs",
			packageManager: "pnpm",
			preset: "recommended",
			styling: ["tailwind"],
			utilities: [],
			stateForm: [],
			auth: [],
			database: [],
			dryRun: false,
		};

		await runPipeline(ctx);

		const projectDir = join(workDir, "e2e-app");
		expect(existsSync(join(projectDir, "package.json"))).toBe(true);
		expect(existsSync(join(projectDir, "src", "app"))).toBe(true);
		expect(existsSync(join(projectDir, "src", "components"))).toBe(true);
		expect(existsSync(join(projectDir, "README.md"))).toBe(true);
		expect(existsSync(join(projectDir, "DECISIONS.md"))).toBe(true);
	}, 120_000);
});
