import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const esToolkitIntegration: Integration = {
	id: "es-toolkit",
	name: "es-toolkit",
	group: "utilities",
	requires: [],
	modifies: [],
	packages: ["es-toolkit"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...esToolkitIntegration.packages], {
			cwd: projectDir,
		});
	},
};

registerIntegration(esToolkitIntegration);

export { esToolkitIntegration };
