import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const zodIntegration: Integration = {
	id: "zod",
	name: "Zod",
	group: "utilities",
	requires: [],
	modifies: [],
	packages: ["zod"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...zodIntegration.packages], { cwd: projectDir });
	},
};

registerIntegration(zodIntegration);

export { zodIntegration };
