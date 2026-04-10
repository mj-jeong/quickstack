import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const framerMotionIntegration: Integration = {
	id: "framer-motion",
	name: "Framer Motion",
	group: "styling",
	requires: [],
	modifies: [],
	packages: ["framer-motion"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...framerMotionIntegration.packages], {
			cwd: projectDir,
		});
	},
};

registerIntegration(framerMotionIntegration);

export { framerMotionIntegration };
