import { checkbox } from "@inquirer/prompts";

const ALL_AUTH = ["next-auth"] as const;
type AuthLib = (typeof ALL_AUTH)[number];

export async function promptAuth(): Promise<Array<"next-auth">> {
	const results = await checkbox<AuthLib | "__all__">({
		message: "Auth (space to select, enter to confirm):",
		choices: [
			{
				name: "Recommended All  (next-auth)",
				value: "__all__" as const,
			},
			{
				name: "NextAuth (Auth.js v5)  — OAuth, session, route protection",
				value: "next-auth",
			},
		],
	});

	if (results.includes("__all__")) {
		return [...ALL_AUTH];
	}
	return results.filter((v): v is AuthLib => v !== "__all__");
}
