import type { ProjectContext } from "../core/context.js";

export interface Integration {
	id: string;
	name: string;
	group: "styling" | "utilities" | "stateForm" | "auth" | "database";
	requires?: string[];
	modifies?: string[];
	packages: string[];
	devPackages?: string[];
	setup(ctx: ProjectContext, projectDir: string): Promise<void>;
}
