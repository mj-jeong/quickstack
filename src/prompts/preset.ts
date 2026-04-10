import { select } from "@inquirer/prompts";

export async function promptPreset(): Promise<"minimal" | "recommended"> {
	return select<"minimal" | "recommended">({
		message: "Preset:",
		default: "recommended",
		choices: [
			{
				name: "minimal",
				value: "minimal",
				description: "CNA default structure — minimal additions",
			},
			{
				name: "recommended",
				value: "recommended",
				description: "Practical directory structure for real-world projects",
			},
		],
	});
}
