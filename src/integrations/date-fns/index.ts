import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const dateFnsIntegration: Integration = {
	id: "date-fns",
	name: "date-fns",
	group: "utilities",
	requires: [],
	modifies: [],
	packages: ["date-fns"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...dateFnsIntegration.packages], { cwd: projectDir });
	},
};

registerIntegration(dateFnsIntegration);

export { dateFnsIntegration };
