import { checkbox } from "@inquirer/prompts";

const ALL_STATE_FORM = ["zustand", "react-hook-form"] as const;
type StateFormLib = (typeof ALL_STATE_FORM)[number];

export async function promptStateForm(): Promise<StateFormLib[]> {
	const results = await checkbox<StateFormLib | "__all__">({
		message: "State / Form (space to select, enter to confirm):",
		choices: [
			{
				name: "Recommended All  (zustand + react-hook-form)",
				value: "__all__" as const,
			},
			{ name: "zustand", value: "zustand" },
			{ name: "react-hook-form", value: "react-hook-form" },
		],
	});

	if (results.includes("__all__")) {
		return [...ALL_STATE_FORM];
	}
	return results.filter((v): v is StateFormLib => v !== "__all__");
}
