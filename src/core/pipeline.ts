import { join } from "node:path";
import type { ProjectContext } from "./context.js";
import { PipelineError } from "./errors.js";

export interface PipelineAction {
	step: string;
	description: string;
	files?: string[];
	commands?: string[];
}

// Placeholder functions for phases 3-5
async function runAdapter(_ctx: ProjectContext): Promise<void> {
	// Implemented in Phase 3 (adapters/next/create.ts)
}

async function runPreset(_ctx: ProjectContext, _projectDir: string): Promise<void> {
	// Implemented in Phase 4 (presets/next/)
}

async function runIntegrations(_ctx: ProjectContext, _projectDir: string): Promise<void> {
	// Implemented in Phase 4 (integrations/)
}

async function runGenerators(_ctx: ProjectContext, _projectDir: string): Promise<void> {
	// Implemented in Phase 5 (generators/)
}

async function runPostProcess(_ctx: ProjectContext, _projectDir: string): Promise<void> {
	// Implemented in Phase 5 (post-processing)
}

function collectAdapterActions(ctx: ProjectContext): PipelineAction {
	return {
		step: "adapter",
		description: `Run create-next-app for "${ctx.projectName}"`,
		commands: [`npx create-next-app@latest ${ctx.projectName} --ts --src-dir --app`],
	};
}

function collectPresetActions(ctx: ProjectContext, _projectDir: string): PipelineAction {
	return {
		step: "preset",
		description: `Apply "${ctx.preset}" preset structure`,
		files: [],
		commands: [],
	};
}

function collectIntegrationActions(ctx: ProjectContext, _projectDir: string): PipelineAction {
	const libs = [...ctx.styling, ...ctx.utilities, ...ctx.stateForm];
	return {
		step: "integrations",
		description: `Install and configure: ${libs.length > 0 ? libs.join(", ") : "(none)"}`,
		packages: libs,
		commands: libs.length > 0 ? [`${ctx.packageManager} add ${libs.join(" ")}`] : [],
	} as PipelineAction & { packages?: string[] };
}

function collectGeneratorActions(_ctx: ProjectContext, _projectDir: string): PipelineAction {
	return {
		step: "generators",
		description: "Generate README.md and DECISIONS.md",
		files: ["README.md", "DECISIONS.md"],
	};
}

export function collectDryRunActions(ctx: ProjectContext): PipelineAction[] {
	const projectDir = join(process.cwd(), ctx.projectName);
	return [
		collectAdapterActions(ctx),
		collectPresetActions(ctx, projectDir),
		collectIntegrationActions(ctx, projectDir),
		collectGeneratorActions(ctx, projectDir),
	];
}

export async function runPipeline(ctx: ProjectContext, projectDir?: string): Promise<void> {
	if (ctx.dryRun) {
		const actions = collectDryRunActions(ctx);
		for (const action of actions) {
			console.log(`\n[dry-run] ${action.step}: ${action.description}`);
			if (action.commands && action.commands.length > 0) {
				for (const cmd of action.commands) {
					console.log(`  $ ${cmd}`);
				}
			}
			if (action.files && action.files.length > 0) {
				for (const file of action.files) {
					console.log(`  + ${file}`);
				}
			}
		}
		return;
	}

	const dir = projectDir ?? join(process.cwd(), ctx.projectName);

	if (!projectDir) {
		try {
			await runAdapter(ctx);
		} catch (err) {
			throw new PipelineError("Adapter step failed", { cause: err });
		}
	}

	try {
		await runPreset(ctx, dir);
	} catch (err) {
		throw new PipelineError("Preset step failed", { cause: err });
	}

	try {
		await runIntegrations(ctx, dir);
	} catch (err) {
		throw new PipelineError("Integrations step failed", { cause: err });
	}

	try {
		await runGenerators(ctx, dir);
	} catch (err) {
		throw new PipelineError("Generators step failed", { cause: err });
	}

	try {
		await runPostProcess(ctx, dir);
	} catch (err) {
		throw new PipelineError("Post-process step failed", { cause: err });
	}
}
