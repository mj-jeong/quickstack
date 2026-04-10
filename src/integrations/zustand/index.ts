import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const zustandIntegration: Integration = {
	id: "zustand",
	name: "Zustand",
	group: "stateForm",
	requires: [],
	modifies: [],
	packages: ["zustand"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...zustandIntegration.packages], { cwd: projectDir });
	},
};

registerIntegration(zustandIntegration);

export { zustandIntegration };
