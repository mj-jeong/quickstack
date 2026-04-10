import { join } from "node:path";
import pc from "picocolors";
import { createNextApp } from "../adapters/next/create.js";
import { writeDecisions } from "../generators/decisions.js";
import { shouldGenerateEnv, writeEnvExample } from "../generators/env.js";
import { appendGitignore } from "../generators/gitignore.js";
import { writeReadme } from "../generators/readme.js";
import { applyStructure } from "../generators/structure.js";
import { registerAllIntegrations } from "../integrations/index.js";
import {
	detectConflicts,
	getIntegration,
	resolveExecutionOrder,
} from "../integrations/registry.js";
import { minimalPreset } from "../presets/next/minimal.js";
import { recommendedPreset } from "../presets/next/recommended.js";
import { ensureDir } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import type { ProjectContext } from "./context.js";
import { PipelineError } from "./errors.js";

export interface PipelineAction {
	step: string;
	description: string;
	files?: string[];
	commands?: string[];
}

async function runAdapter(ctx: ProjectContext): Promise<void> {
	await createNextApp(ctx);
}

async function runPreset(ctx: ProjectContext, projectDir: string): Promise<void> {
	const preset = ctx.preset === "minimal" ? minimalPreset : recommendedPreset;
	for (const dir of preset.directories) {
		await ensureDir(join(projectDir, dir));
	}
}

async function runIntegrations(ctx: ProjectContext, projectDir: string): Promise<void> {
	await registerAllIntegrations();

	const selectedIds = [...ctx.styling, ...ctx.utilities, ...ctx.stateForm] as string[];

	if (selectedIds.length === 0) {
		return;
	}

	// Warn about conflicts
	const conflicts = detectConflicts(selectedIds);
	for (const conflict of conflicts) {
		logger.warn(
			`File conflict detected: "${conflict.file}" is modified by multiple integrations: ${conflict.integrations.join(", ")}`,
		);
	}

	const orderedIds = resolveExecutionOrder(selectedIds);

	for (const id of orderedIds) {
		const integration = getIntegration(id);
		if (!integration) {
			logger.warn(`Integration "${id}" not found in registry — skipping.`);
			continue;
		}
		await integration.setup(ctx, projectDir);
	}
}

async function runGenerators(ctx: ProjectContext, projectDir: string): Promise<void> {
	await applyStructure(ctx, projectDir);
	await writeReadme(ctx, projectDir);
	await writeDecisions(ctx, projectDir);
	await appendGitignore(projectDir);
	if (shouldGenerateEnv(ctx)) {
		await writeEnvExample(ctx, projectDir);
	}
}

async function postProcess(ctx: ProjectContext, _projectDir: string): Promise<void> {
	const { projectName, packageManager } = ctx;
	const allLibs = [...ctx.styling, ...ctx.utilities, ...ctx.stateForm];

	console.log("");
	console.log(pc.green(`✔ Project ${pc.bold(projectName)} created successfully!`));
	console.log("");
	console.log(pc.bold("Next steps:"));

	console.log(`  ${pc.cyan(`cd ${projectName}`)}`);

	if (packageManager === "npm") {
		console.log(`  ${pc.cyan("npm install")}`);
		console.log(`  ${pc.cyan("npm run dev")}`);
	} else if (packageManager === "pnpm") {
		console.log(`  ${pc.cyan("pnpm dev")}`);
	} else {
		console.log(`  ${pc.cyan("yarn dev")}`);
	}

	console.log("");

	if (allLibs.length > 0) {
		console.log(`Selected libraries: ${pc.yellow(allLibs.join(", "))}`);
	} else {
		console.log("No additional libraries selected.");
	}

	console.log("");
}

async function runPostProcess(ctx: ProjectContext, projectDir: string): Promise<void> {
	await postProcess(ctx, projectDir);
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
