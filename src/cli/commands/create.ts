import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Command } from "commander";
import { PipelineError, QuickStackError, ValidationError } from "../../core/errors.js";
import { runPipeline } from "../../core/pipeline.js";
import { runPrompts } from "../../prompts/index.js";
import { logger } from "../../utils/logger.js";

export function registerCreateCommand(program: Command): void {
	program
		.command("create [project-name]")
		.description("Create a new Next.js project with QuickStackTool scaffolding")
		.option("--dry-run", "Preview actions without making any changes")
		.action(async (projectName: string | undefined, options: { dryRun?: boolean }) => {
			try {
				const ctx = await runPrompts(projectName, options.dryRun ?? false);

				if (!ctx.dryRun) {
					if (ctx.setupMode === "new-directory") {
						const targetDir = join(process.cwd(), ctx.projectName);
						if (existsSync(targetDir)) {
							throw new ValidationError(
								`Directory "${ctx.projectName}" already exists. Please pick a different name or remove the existing directory.`,
							);
						}
					} else {
						const entries = readdirSync(process.cwd()).filter((name) => !name.startsWith("."));
						if (entries.length > 0) {
							throw new ValidationError(
								`Current directory is not empty. Run in an empty directory.\nFound: ${entries.slice(0, 5).join(", ")}${entries.length > 5 ? "..." : ""}`,
							);
						}
					}
				}

				await runPipeline(ctx);
			} catch (err) {
				if (err instanceof ValidationError) {
					logger.error(err.message);
					process.exit(2);
				}
				if (err instanceof PipelineError) {
					logger.error(err.message);
					if (err.cause instanceof Error) {
						logger.error(`  cause: ${err.cause.message}`);
					}
					process.exit(1);
				}
				if (err instanceof QuickStackError) {
					logger.error(err.message);
					process.exit(1);
				}
				if (err instanceof Error) {
					logger.error(err.message);
					if (process.env.QUICKSTACK_DEBUG) {
						console.error(err.stack);
					}
				} else {
					logger.error(String(err));
				}
				process.exit(1);
			}
		});
}
