import { join } from "node:path";
import pc from "picocolors";
import { createNextApp } from "../adapters/next/create.js";
import { buildCnaArgs } from "../adapters/next/options.js";
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
	packages?: string[];
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

	const selectedIds = [
		...ctx.styling,
		...ctx.utilities,
		...ctx.stateForm,
		...ctx.auth,
		...ctx.database,
	] as string[];

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
		try {
			await integration.setup(ctx, projectDir);
		} catch (err) {
			// shadcn init is non-fatal: warn and continue.
			if (id === "shadcn") {
				logger.warn(
					`shadcn init failed — continuing without it. You can retry manually: npx shadcn@latest init --defaults`,
				);
				if (err instanceof Error) {
					logger.warn(`  reason: ${err.message}`);
				}
				continue;
			}
			throw new PipelineError(`Integration "${id}" setup failed`, { cause: err });
		}
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
	const allLibs = [
		...ctx.styling,
		...ctx.utilities,
		...ctx.stateForm,
		...ctx.auth,
		...ctx.database,
	];

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

// ── dry-run collection ──────────────────────────────────────────────────────

function collectAdapterAction(ctx: ProjectContext): PipelineAction {
	const args = buildCnaArgs(ctx);
	return {
		step: "create-next-app",
		description: `Run create-next-app for "${ctx.projectName}"`,
		commands: [`npx create-next-app@latest ${args.join(" ")}`],
	};
}

function collectPresetAction(ctx: ProjectContext): PipelineAction {
	const preset = ctx.preset === "minimal" ? minimalPreset : recommendedPreset;
	return {
		step: "apply-preset",
		description: `Apply "${preset.name}" preset directory structure`,
		files: preset.directories.map((d) => `${d}/`),
	};
}

function collectIntegrationActions(ctx: ProjectContext): PipelineAction[] {
	const selectedIds = [
		...ctx.styling,
		...ctx.utilities,
		...ctx.stateForm,
		...ctx.auth,
		...ctx.database,
	] as string[];
	if (selectedIds.length === 0) {
		return [];
	}

	let orderedIds: string[];
	try {
		orderedIds = resolveExecutionOrder(selectedIds);
	} catch {
		// Fall back to input order when dependency resolution fails in dry-run.
		orderedIds = selectedIds;
	}

	const actions: PipelineAction[] = [];
	for (const id of orderedIds) {
		const integration = getIntegration(id);
		if (!integration) {
			actions.push({
				step: `integration:${id}`,
				description: `Unknown integration "${id}" — would be skipped.`,
			});
			continue;
		}

		const commands: string[] = [];
		if (integration.packages.length > 0) {
			commands.push(`${ctx.packageManager} add ${integration.packages.join(" ")}`);
		}
		if (integration.devPackages && integration.devPackages.length > 0) {
			commands.push(`${ctx.packageManager} add -D ${integration.devPackages.join(" ")}`);
		}
		if (id === "shadcn") {
			commands.push("npx shadcn@latest init --defaults");
		}

		actions.push({
			step: `integration:${id}`,
			description: `Configure ${integration.name}`,
			packages: integration.packages,
			files: integration.modifies ?? [],
			commands,
		});
	}
	return actions;
}

function collectGeneratorAction(ctx: ProjectContext): PipelineAction {
	const files = ["README.md", "DECISIONS.md", ".gitignore (append)"];
	if (shouldGenerateEnv(ctx)) {
		files.push(".env.example");
	}
	const preset = ctx.preset === "minimal" ? minimalPreset : recommendedPreset;
	for (const dir of preset.directories) {
		files.push(`${dir}/.gitkeep`);
	}
	return {
		step: "generators",
		description: "Generate docs, env, and structural files",
		files,
	};
}

function collectPostProcessAction(ctx: ProjectContext): PipelineAction {
	const commands: string[] = [`cd ${ctx.projectName}`];
	if (ctx.packageManager === "npm") {
		commands.push("npm install", "npm run dev");
	} else if (ctx.packageManager === "pnpm") {
		commands.push("pnpm dev");
	} else {
		commands.push("yarn dev");
	}
	return {
		step: "post-process",
		description: "Print next-step instructions",
		commands,
	};
}

export async function collectDryRunActions(ctx: ProjectContext): Promise<PipelineAction[]> {
	// Ensure integrations are registered so we can inspect packages/modifies.
	await registerAllIntegrations();

	const actions: PipelineAction[] = [];
	actions.push(collectAdapterAction(ctx));
	actions.push(collectPresetAction(ctx));
	actions.push(...collectIntegrationActions(ctx));
	actions.push(collectGeneratorAction(ctx));
	actions.push(collectPostProcessAction(ctx));
	return actions;
}

function printDryRunPlan(actions: PipelineAction[]): void {
	console.log("");
	console.log(pc.bold(pc.cyan("── DRY-RUN PLAN ──")));
	console.log(pc.dim("No files will be written, no commands will be executed."));
	console.log("");

	for (const action of actions) {
		console.log(
			`${pc.bold(pc.yellow("▸"))} ${pc.bold(action.step)}  ${pc.dim(action.description)}`,
		);
		if (action.commands && action.commands.length > 0) {
			for (const cmd of action.commands) {
				console.log(`    ${pc.green("$")} ${cmd}`);
			}
		}
		if (action.packages && action.packages.length > 0) {
			console.log(`    ${pc.cyan("packages")}: ${action.packages.join(", ")}`);
		}
		if (action.files && action.files.length > 0) {
			for (const file of action.files) {
				console.log(`    ${pc.magenta("+")} ${file}`);
			}
		}
		console.log("");
	}
}

// ── main entry ──────────────────────────────────────────────────────────────

export async function runPipeline(ctx: ProjectContext, projectDir?: string): Promise<void> {
	if (ctx.dryRun) {
		const actions = await collectDryRunActions(ctx);
		printDryRunPlan(actions);
		return;
	}

	const dir = projectDir ?? join(process.cwd(), ctx.projectName);

	if (!projectDir) {
		try {
			await runAdapter(ctx);
		} catch (err) {
			if (err instanceof PipelineError) {
				throw err;
			}
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
		if (err instanceof PipelineError) {
			throw err;
		}
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
