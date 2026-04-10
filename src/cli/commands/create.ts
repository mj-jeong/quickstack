import type { Command } from "commander";
import { runPipeline } from "../../core/pipeline.js";
import { runPrompts } from "../../prompts/index.js";
import { logger } from "../../utils/logger.js";

export function registerCreateCommand(program: Command): void {
	program
		.command("create [project-name]")
		.description("Create a new Next.js project with QuickStack scaffolding")
		.option("--dry-run", "Preview actions without making any changes")
		.action(async (projectName: string | undefined, options: { dryRun?: boolean }) => {
			try {
				const ctx = await runPrompts(projectName, options.dryRun ?? false);
				await runPipeline(ctx);
			} catch (err) {
				if (err instanceof Error) {
					logger.error(err.message);
				} else {
					logger.error(String(err));
				}
				process.exit(1);
			}
		});
}
