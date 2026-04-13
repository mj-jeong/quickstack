import { checkbox } from "@inquirer/prompts";

const ALL_STYLING = ["tailwind", "shadcn", "lucide-react", "framer-motion"] as const;
type StylingLib = (typeof ALL_STYLING)[number];

export async function promptStyling(): Promise<StylingLib[]> {
	const results = await checkbox<StylingLib | "__all__">({
		message: "Styling / UI (space to select, enter to confirm):",
		choices: [
			{
				name: "Recommended All  (Tailwind CSS + shadcn/ui + lucide-react + framer-motion)",
				value: "__all__" as const,
			},
			{ name: "Tailwind CSS", value: "tailwind" },
			{ name: "shadcn/ui  (requires Tailwind CSS)", value: "shadcn" },
			{ name: "lucide-react", value: "lucide-react" },
			{ name: "framer-motion", value: "framer-motion" },
		],
	});

	if (results.includes("__all__")) {
		return [...ALL_STYLING];
	}
	return results.filter((v): v is StylingLib => v !== "__all__");
}
