import { select } from "@inquirer/prompts";

export async function promptPackageManager(): Promise<"npm" | "pnpm" | "yarn"> {
	return select<"npm" | "pnpm" | "yarn">({
		message: "Package manager:",
		default: "pnpm",
		choices: [
			{ name: "pnpm", value: "pnpm" },
			{ name: "npm", value: "npm" },
			{ name: "yarn", value: "yarn" },
		],
	});
}
