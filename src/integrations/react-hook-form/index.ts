import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const reactHookFormIntegration: Integration = {
	id: "react-hook-form",
	name: "React Hook Form",
	group: "stateForm",
	requires: [],
	modifies: [],
	packages: ["react-hook-form"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...reactHookFormIntegration.packages], {
			cwd: projectDir,
		});
	},
};

registerIntegration(reactHookFormIntegration);

export { reactHookFormIntegration };
