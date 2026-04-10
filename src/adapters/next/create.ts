import type { ProjectContext } from "../../core/context.js";
import { PipelineError } from "../../core/errors.js";
import { exec } from "../../utils/exec.js";
import { logger } from "../../utils/logger.js";
import { buildCnaArgs } from "./options.js";

export async function createNextApp(ctx: ProjectContext): Promise<void> {
	const args = buildCnaArgs(ctx);
	const spinner = logger.spinner(`Creating Next.js app "${ctx.projectName}"...`);

	try {
		await exec("npx", ["create-next-app@latest", ...args]);
		spinner.stop(`Next.js app "${ctx.projectName}" created.`);
	} catch (err) {
		spinner.fail(`Failed to create Next.js app "${ctx.projectName}".`);
		throw new PipelineError(`create-next-app failed`, { cause: err });
	}
}
