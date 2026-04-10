import { checkbox } from "@inquirer/prompts";

export async function promptStateForm(): Promise<
	Array<"zustand" | "react-hook-form" | "supabase">
> {
	return checkbox<"zustand" | "react-hook-form" | "supabase">({
		message: "State / Form / Backend (space to select, enter to confirm):",
		choices: [
			{ name: "zustand", value: "zustand" },
			{ name: "react-hook-form", value: "react-hook-form" },
			{ name: "supabase  (optional backend integration)", value: "supabase" },
		],
	});
}
