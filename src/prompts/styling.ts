import { checkbox } from "@inquirer/prompts";

export async function promptStyling(): Promise<Array<"tailwind" | "shadcn" | "framer-motion">> {
	return checkbox<"tailwind" | "shadcn" | "framer-motion">({
		message: "Styling / UI (space to select, enter to confirm):",
		choices: [
			{ name: "Tailwind CSS", value: "tailwind" },
			{ name: "shadcn/ui  (requires Tailwind CSS)", value: "shadcn" },
			{ name: "framer-motion", value: "framer-motion" },
		],
	});
}
