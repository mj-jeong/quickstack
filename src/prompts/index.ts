import { type ProjectContext, ProjectContextSchema } from "../core/context.js";
import { logger } from "../utils/logger.js";
import { promptAuth } from "./auth.js";
import { promptConfirm } from "./confirm.js";
import { promptDatabase } from "./database.js";
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
	auth: string[];
	database: string[];
}): {
	styling: string[];
	utilities: string[];
	stateForm: string[];
	auth: string[];
	database: string[];
} {
	let styling = [...selections.styling];
	const utilities = [...selections.utilities];
	const stateForm = [...selections.stateForm];
	const auth = [...selections.auth];
	const database = [...selections.database];

	if (styling.includes("shadcn") && !styling.includes("tailwind")) {
		styling = ["tailwind", ...styling];
	}

	if (styling.includes("shadcn") && !styling.includes("lucide-react")) {
		styling.push("lucide-react");
	}

	return { styling, utilities, stateForm, auth, database };
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
		const auth = await promptAuth();
		const database = await promptDatabase();

		const resolved = resolveImplicitDeps({
			styling: rawStyling,
			utilities,
			stateForm: rawStateForm,
			auth,
			database,
		});

		if (resolved.styling.includes("tailwind") && !rawStyling.includes("tailwind")) {
			logger.info("ℹ shadcn/ui requires Tailwind CSS — automatically included.");
		}

		if (resolved.styling.includes("lucide-react") && !rawStyling.includes("lucide-react")) {
			logger.info("ℹ shadcn/ui uses lucide-react icons — automatically included.");
		}

		const partial: Partial<ProjectContext> = {
			projectName,
			packageManager,
			preset,
			styling: resolved.styling as ProjectContext["styling"],
			utilities: resolved.utilities as ProjectContext["utilities"],
			stateForm: resolved.stateForm as ProjectContext["stateForm"],
			auth: resolved.auth as ProjectContext["auth"],
			database: resolved.database as ProjectContext["database"],
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
			auth: resolved.auth,
			database: resolved.database,
			dryRun: dryRun ?? false,
		});

		return ctx;
	}
}
