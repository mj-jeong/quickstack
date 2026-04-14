import { basename } from "node:path";
import { input } from "@inquirer/prompts";
import { validateProjectName } from "../utils/validate.js";

export async function promptProjectName(
	setupMode: "new-directory" | "current-directory",
	initial?: string,
): Promise<string> {
	if (initial !== undefined) {
		const result = validateProjectName(initial);
		if (!result.valid) {
			throw new Error(result.message ?? "Invalid project name.");
		}
		return initial;
	}

	const defaultName = setupMode === "current-directory" ? basename(process.cwd()) : undefined;
	const message =
		setupMode === "current-directory" ? "Project name (for package.json):" : "Project name:";

	return input({
		message,
		default: defaultName,
		validate(value: string) {
			const result = validateProjectName(value);
			if (!result.valid) {
				return result.message ?? "Invalid project name.";
			}
			return true;
		},
	});
}
