import { checkbox } from "@inquirer/prompts";

export async function promptUtilities(): Promise<
	Array<"zod" | "date-fns" | "ts-pattern" | "es-toolkit">
> {
	return checkbox<"zod" | "date-fns" | "ts-pattern" | "es-toolkit">({
		message: "Utilities (space to select, enter to confirm):",
		choices: [
			{ name: "zod", value: "zod" },
			{ name: "date-fns", value: "date-fns" },
			{ name: "ts-pattern", value: "ts-pattern" },
			{ name: "es-toolkit", value: "es-toolkit" },
		],
	});
}
