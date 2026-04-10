import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const tailwindIntegration: Integration = {
	id: "tailwind",
	name: "Tailwind CSS",
	group: "styling",
	requires: [],
	modifies: [],
	packages: [],
	setup: async (_ctx, _projectDir): Promise<void> => {
		// CNA --tailwind 플래그로 설치 및 설정이 처리됨. no-op.
	},
};

registerIntegration(tailwindIntegration);

export { tailwindIntegration };
