/**
 * Integration tests — fixture-based pipeline flow.
 *
 * Strategy:
 *   1. Mock `createNextApp` (the adapter) so no real CNA process is started.
 *   2. Mock `exec` (child process wrapper) so shadcn init / package installs
 *      are captured but not executed.
 *   3. Copy a CNA output fixture into a tmpdir, then run the pipeline
 *      against that directory.
 *
 * If the CNA fixtures have not been generated yet (because the environment
 * is offline) the tests in this file are skipped instead of failing so that
 * CI still passes on a clean checkout.
 */

import { cpSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import type { ProjectContext } from "../../src/core/context.js";

// ── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../../src/adapters/next/create.js", () => ({
	createNextApp: vi.fn(async () => {
		// No-op: fixture is copied into the target dir by the test setup.
	}),
}));

vi.mock("../../src/utils/exec.js", () => ({
	exec: vi.fn(async () => ({ stdout: "", stderr: "", exitCode: 0 })),
}));

// Imported after the mocks so the pipeline picks up the mocked modules.
const { runPipeline } = await import("../../src/core/pipeline.js");
const { exec } = await import("../../src/utils/exec.js");

// ── Fixture discovery ───────────────────────────────────────────────────────

const FIXTURE_ROOT = resolve(__dirname, "..", "fixtures", "cna-output");
const FIXTURE_TAILWIND = join(FIXTURE_ROOT, "next15-app-tailwind");
const FIXTURE_NO_TAILWIND = join(FIXTURE_ROOT, "next15-app-no-tailwind");

const FIXTURE_TAILWIND_EXISTS = existsSync(FIXTURE_TAILWIND);
const FIXTURE_NO_TAILWIND_EXISTS = existsSync(FIXTURE_NO_TAILWIND);
const ANY_FIXTURE_EXISTS = FIXTURE_TAILWIND_EXISTS || FIXTURE_NO_TAILWIND_EXISTS;

// ── Helpers ────────────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<ProjectContext> = {}): ProjectContext {
	return {
		projectName: "test-app",
		framework: "nextjs",
		packageManager: "pnpm",
		preset: "minimal",
		styling: [],
		utilities: [],
		stateForm: [],
		auth: [],
		database: [],
		dryRun: false,
		...overrides,
	};
}

function stageFixture(source: string): string {
	const dir = mkdtempSync(join(tmpdir(), "qs-integ-"));
	cpSync(source, dir, { recursive: true });
	onTestFinished(async () => {
		const { rm } = await import("node:fs/promises");
		await rm(dir, { recursive: true, force: true }).catch(() => undefined);
	});
	return dir;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("pipeline integration (fixture-based)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it.skipIf(!ANY_FIXTURE_EXISTS)("has at least one fixture available (sanity)", () => {
		expect(ANY_FIXTURE_EXISTS).toBe(true);
	});

	it.skipIf(!FIXTURE_NO_TAILWIND_EXISTS)(
		"minimal preset with no libraries keeps CNA base structure intact",
		async () => {
			const dir = stageFixture(FIXTURE_NO_TAILWIND);
			const ctx = makeCtx({ preset: "minimal" });

			await runPipeline(ctx, dir);

			// CNA base files are still there after pipeline runs.
			expect(existsSync(join(dir, "package.json"))).toBe(true);
			expect(existsSync(join(dir, "src", "app"))).toBe(true);

			// Generators produced the expected docs.
			expect(existsSync(join(dir, "README.md"))).toBe(true);
			expect(existsSync(join(dir, "DECISIONS.md"))).toBe(true);

			// Minimal preset does not create extra src/ sub-folders.
			expect(existsSync(join(dir, "src", "components"))).toBe(false);
			expect(existsSync(join(dir, "src", "features"))).toBe(false);
		},
	);

	it.skipIf(!FIXTURE_TAILWIND_EXISTS)(
		"recommended preset + tailwind + shadcn creates preset dirs and invokes shadcn init",
		async () => {
			const dir = stageFixture(FIXTURE_TAILWIND);
			const ctx = makeCtx({
				preset: "recommended",
				styling: ["tailwind", "shadcn"],
			});

			await runPipeline(ctx, dir);

			// Recommended preset directories are materialized with .gitkeep.
			for (const sub of ["components", "features", "lib", "hooks", "styles", "types"]) {
				expect(existsSync(join(dir, "src", sub))).toBe(true);
				expect(existsSync(join(dir, "src", sub, ".gitkeep"))).toBe(true);
			}

			// shadcn init was invoked via exec.
			const execMock = vi.mocked(exec);
			const calls = execMock.mock.calls;
			const shadcnCall = calls.find(
				(call) =>
					typeof call[0] === "string" &&
					call[0] === "npx" &&
					Array.isArray(call[1]) &&
					call[1][0] === "shadcn@latest",
			);
			expect(shadcnCall).toBeDefined();
		},
	);

	it.skipIf(!FIXTURE_TAILWIND_EXISTS)(
		"recommended preset + supabase writes env example and client helper",
		async () => {
			const dir = stageFixture(FIXTURE_TAILWIND);
			const ctx = makeCtx({
				preset: "recommended",
				database: ["supabase"],
			});

			await runPipeline(ctx, dir);

			expect(existsSync(join(dir, ".env.example"))).toBe(true);
			expect(existsSync(join(dir, "src", "lib", "supabase", "client.ts"))).toBe(true);

			const envContent = readFileSync(join(dir, ".env.example"), "utf-8");
			expect(envContent).toContain("NEXT_PUBLIC_SUPABASE_URL");
			expect(envContent).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");

			// Supabase install command goes through exec (mocked).
			const execMock = vi.mocked(exec);
			const installCall = execMock.mock.calls.find(
				(call) =>
					typeof call[0] === "string" &&
					call[0] === "pnpm" &&
					Array.isArray(call[1]) &&
					call[1][0] === "add" &&
					call[1].includes("@supabase/supabase-js"),
			);
			expect(installCall).toBeDefined();
		},
	);

	it.skipIf(!FIXTURE_NO_TAILWIND_EXISTS)(
		"README.md contains the project name and getting started section",
		async () => {
			const dir = stageFixture(FIXTURE_NO_TAILWIND);
			const ctx = makeCtx({
				projectName: "shiny-app",
				preset: "minimal",
				packageManager: "pnpm",
			});

			await runPipeline(ctx, dir);

			const readme = readFileSync(join(dir, "README.md"), "utf-8");
			expect(readme).toContain("# shiny-app");
			expect(readme).toContain("Getting Started");
			expect(readme).toContain("pnpm dev");
		},
	);

	it.skipIf(!FIXTURE_NO_TAILWIND_EXISTS)(
		"DECISIONS.md records source attribution for official defaults",
		async () => {
			const dir = stageFixture(FIXTURE_NO_TAILWIND);
			const ctx = makeCtx({ preset: "recommended", utilities: ["zod"] });

			await runPipeline(ctx, dir);

			const decisions = readFileSync(join(dir, "DECISIONS.md"), "utf-8");
			expect(decisions).toContain("# Decisions");
			expect(decisions).toContain("[Official default]");
			expect(decisions).toContain("[QuickStack opinion]");
			expect(decisions).toContain("[Community-common]");
			expect(decisions).toContain("zod");
		},
	);
});
