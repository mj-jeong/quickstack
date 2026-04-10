import { exec } from "../../utils/exec.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const shadcnIntegration: Integration = {
	id: "shadcn",
	name: "shadcn/ui",
	group: "styling",
	requires: ["tailwind"],
	modifies: ["components.json", "src/lib/utils.ts", "src/app/globals.css"],
	packages: [],
	setup: async (_ctx, projectDir): Promise<void> => {
		await exec("npx", ["shadcn@latest", "init", "--defaults"], { cwd: projectDir });
	},
};

registerIntegration(shadcnIntegration);

export { shadcnIntegration };
