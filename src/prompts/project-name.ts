import { input } from "@inquirer/prompts";
import { validateProjectName } from "../utils/validate.js";

export async function promptProjectName(initial?: string): Promise<string> {
	if (initial !== undefined) {
		const result = validateProjectName(initial);
		if (!result.valid) {
			throw new Error(result.message ?? "Invalid project name.");
		}
		return initial;
	}

	return input({
		message: "Project name:",
		validate(value: string) {
			const result = validateProjectName(value);
			if (!result.valid) {
				return result.message ?? "Invalid project name.";
			}
			return true;
		},
	});
}
