import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const tsPatternIntegration: Integration = {
	id: "ts-pattern",
	name: "ts-pattern",
	group: "utilities",
	requires: [],
	modifies: [],
	packages: ["ts-pattern"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...tsPatternIntegration.packages], { cwd: projectDir });
	},
};

registerIntegration(tsPatternIntegration);

export { tsPatternIntegration };
