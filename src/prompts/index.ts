import { type ProjectContext, ProjectContextSchema } from "../core/context.js";
import { logger } from "../utils/logger.js";
import { promptConfirm } from "./confirm.js";
import { promptPackageManager } from "./package-manager.js";
import { promptPreset } from "./preset.js";
import { promptProjectName } from "./project-name.js";
import { promptStateForm } from "./state-form.js";
import { promptStyling } from "./styling.js";
import { promptUtilities } from "./utilities.js";

export function resolveImplicitDeps(selections: {
	styling: string[];
	utilities: string[];
	stateForm: string[];
}): { styling: string[]; utilities: string[]; stateForm: string[] } {
	let styling = [...selections.styling];
	const utilities = [...selections.utilities];
	const stateForm = [...selections.stateForm];

	if (styling.includes("shadcn") && !styling.includes("tailwind")) {
		styling = ["tailwind", ...styling];
	}

	return { styling, utilities, stateForm };
}

export async function runPrompts(initialName?: string, dryRun?: boolean): Promise<ProjectContext> {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const projectName = await promptProjectName(initialName);
		const packageManager = await promptPackageManager();
		const preset = await promptPreset();
		const rawStyling = await promptStyling();
		const utilities = await promptUtilities();
		const rawStateForm = await promptStateForm();

		const resolved = resolveImplicitDeps({
			styling: rawStyling,
			utilities,
			stateForm: rawStateForm,
		});

		if (resolved.styling.includes("tailwind") && !rawStyling.includes("tailwind")) {
			logger.info("ℹ shadcn/ui requires Tailwind CSS — automatically included.");
		}

		const partial: Partial<ProjectContext> = {
			projectName,
			packageManager,
			preset,
			styling: resolved.styling as ProjectContext["styling"],
			utilities: resolved.utilities as ProjectContext["utilities"],
			stateForm: resolved.stateForm as ProjectContext["stateForm"],
		};

		const confirmed = await promptConfirm(partial);

		if (!confirmed) {
			process.exit(0);
		}

		const ctx = ProjectContextSchema.parse({
			projectName,
			framework: "nextjs",
			packageManager,
			preset,
			styling: resolved.styling,
			utilities: resolved.utilities,
			stateForm: resolved.stateForm,
			auth: [],
			database: [],
			dryRun: dryRun ?? false,
		});

		return ctx;
	}
}
