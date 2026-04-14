import type { ProjectContext } from "../../core/context.js";
import { PipelineError } from "../../core/errors.js";
import { exec } from "../../utils/exec.js";
import { logger } from "../../utils/logger.js";
import { buildCnaArgs } from "./options.js";

export async function createNextApp(ctx: ProjectContext): Promise<void> {
	const args = buildCnaArgs(ctx);
	const label =
		ctx.setupMode === "current-directory"
			? "Creating Next.js app in current directory..."
			: `Creating Next.js app "${ctx.projectName}"...`;
	const spinner = logger.spinner(label);

	try {
		await exec("npx", ["create-next-app@latest", ...args]);
		spinner.stop("Next.js app created.");
	} catch (err) {
		spinner.fail("Failed to create Next.js app.");
		throw new PipelineError("create-next-app failed", { cause: err });
	}
}
