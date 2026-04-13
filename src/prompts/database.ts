import { checkbox } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";

type DatabaseLib = "prisma" | "drizzle" | "supabase";

const RECOMMENDED_DB: DatabaseLib[] = ["supabase", "prisma"];

async function promptDatabaseOnce(preset?: string): Promise<DatabaseLib[]> {
	const defaultRecommended = preset === "recommended";
	const results = await checkbox<DatabaseLib | "__recommended__">({
		message: "Database (space to select, enter to confirm):",
		choices: [
			{
				name: "Recommended  (supabase + Prisma)",
				value: "__recommended__" as const,
				checked: defaultRecommended,
			},
			{
				name: "supabase  (BaaS — database + auth + storage)",
				value: "supabase",
			},
			{
				name: "Prisma    (Type-safe ORM)",
				value: "prisma",
			},
			{
				name: "Drizzle   (Lightweight ORM — alternative to Prisma)",
				value: "drizzle",
			},
		],
	});

	if (results.includes("__recommended__")) {
		return [...RECOMMENDED_DB];
	}
	return results.filter((v): v is DatabaseLib => v !== "__recommended__");
}

export async function promptDatabase(
	preset?: string,
	attempt = 0,
): Promise<Array<"prisma" | "drizzle" | "supabase">> {
	const results = await promptDatabaseOnce(preset);

	const hasPrisma = results.includes("prisma");
	const hasDrizzle = results.includes("drizzle");

	if (hasPrisma && hasDrizzle) {
		logger.warn("Prisma와 Drizzle은 동일한 역할(ORM)입니다. 하나만 선택해주세요.");

		if (attempt >= 2) {
			return results.filter((v) => v !== "drizzle") as Array<"prisma" | "drizzle" | "supabase">;
		}

		return promptDatabase(preset, attempt + 1);
	}

	return results;
}
