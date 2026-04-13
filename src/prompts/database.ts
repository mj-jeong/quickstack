import { checkbox } from "@inquirer/prompts";
import { logger } from "../utils/logger.js";

type DatabaseLib = "prisma" | "drizzle" | "supabase";

async function promptDatabaseOnce(): Promise<DatabaseLib[]> {
	const results = await checkbox<DatabaseLib>({
		message: "Database (space to select, enter to confirm):",
		choices: [
			{
				name: "supabase  (BaaS — database + auth + storage)",
				value: "supabase",
			},
			{
				name: "Prisma    (Type-safe ORM)",
				value: "prisma",
			},
			{
				name: "Drizzle   (Lightweight ORM)",
				value: "drizzle",
			},
		],
	});

	return results;
}

export async function promptDatabase(
	attempt = 0,
): Promise<Array<"prisma" | "drizzle" | "supabase">> {
	const results = await promptDatabaseOnce();

	const hasPrisma = results.includes("prisma");
	const hasDrizzle = results.includes("drizzle");

	if (hasPrisma && hasDrizzle) {
		logger.warn("Prisma와 Drizzle은 동일한 역할(ORM)입니다. 하나만 선택해주세요.");

		if (attempt >= 2) {
			// 최대 3회(0,1,2) 재시도 후 drizzle 제거
			return results.filter((v) => v !== "drizzle") as Array<"prisma" | "drizzle" | "supabase">;
		}

		return promptDatabase(attempt + 1);
	}

	return results;
}
