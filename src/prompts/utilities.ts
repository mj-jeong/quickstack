import { checkbox } from "@inquirer/prompts";

const ALL_UTILITIES = ["zod", "date-fns", "ts-pattern", "es-toolkit"] as const;
type UtilityLib = (typeof ALL_UTILITIES)[number];

export async function promptUtilities(): Promise<UtilityLib[]> {
	const results = await checkbox<UtilityLib | "__all__">({
		message: "Utilities (space to select, enter to confirm):",
		choices: [
			{
				name: "Recommended All  (zod + date-fns + ts-pattern + es-toolkit)",
				value: "__all__" as const,
			},
			{ name: "zod", value: "zod" },
			{ name: "date-fns", value: "date-fns" },
			{ name: "ts-pattern", value: "ts-pattern" },
			{ name: "es-toolkit", value: "es-toolkit" },
		],
	});

	if (results.includes("__all__")) {
		return [...ALL_UTILITIES];
	}
	return results.filter((v): v is UtilityLib => v !== "__all__");
}
