import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const lucideReactIntegration: Integration = {
	id: "lucide-react",
	name: "Lucide React",
	group: "styling",
	requires: [],
	modifies: [],
	packages: ["lucide-react"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...lucideReactIntegration.packages], {
			cwd: projectDir,
		});
	},
};

registerIntegration(lucideReactIntegration);

export { lucideReactIntegration };
