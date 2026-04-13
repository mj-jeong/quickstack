import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ProjectContext } from "../core/context.js";

interface EnvEntry {
	comment?: string;
	key: string;
	placeholder: string;
}

// Each integration can contribute env entries here as the project grows.
function collectEnvEntries(ctx: ProjectContext): EnvEntry[] {
	const entries: EnvEntry[] = [];

	if (ctx.database.includes("supabase")) {
		entries.push(
			{ comment: "Supabase", key: "NEXT_PUBLIC_SUPABASE_URL", placeholder: "your-supabase-url" },
			{
				key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
				placeholder: "your-supabase-anon-key",
			},
		);
	}

	return entries;
}

export function shouldGenerateEnv(ctx: ProjectContext): boolean {
	return ctx.database.includes("supabase");
}

export async function writeEnvExample(ctx: ProjectContext, projectDir: string): Promise<void> {
	const entries = collectEnvEntries(ctx);

	if (entries.length === 0) {
		return;
	}

	const lines: string[] = [];
	for (const entry of entries) {
		if (entry.comment) {
			lines.push(`# ${entry.comment}`);
		}
		lines.push(`${entry.key}=${entry.placeholder}`);
	}
	lines.push("");

	await writeFile(join(projectDir, ".env.example"), lines.join("\n"));
}
