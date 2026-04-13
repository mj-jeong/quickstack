import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { exec } from "../../utils/exec.js";
import { ensureDir, writeFileSafe } from "../../utils/fs.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const DRIZZLE_CONFIG_CONTENT = `import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/lib/drizzle/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
`;

const DRIZZLE_CLIENT_CONTENT = `import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
`;

const DRIZZLE_SCHEMA_CONTENT = `// Define your schema here
// Example:
// import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
//
// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   name: text("name"),
//   createdAt: timestamp("created_at").defaultNow(),
// });
`;

const ENV_EXAMPLE_CONTENT = `
# Drizzle
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
`;

const drizzleIntegration: Integration = {
	id: "drizzle",
	name: "Drizzle ORM",
	group: "database",
	requires: [],
	modifies: [
		"drizzle.config.ts",
		"src/lib/drizzle/client.ts",
		"src/lib/drizzle/schema.ts",
		".env.example",
	],
	packages: ["drizzle-orm", "postgres"],
	devPackages: ["drizzle-kit"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", "drizzle-orm", "postgres"], {
			cwd: projectDir,
		});
		await exec(ctx.packageManager, ["add", "-D", "drizzle-kit"], {
			cwd: projectDir,
		});

		await writeFileSafe(join(projectDir, "drizzle.config.ts"), DRIZZLE_CONFIG_CONTENT);

		await ensureDir(join(projectDir, "src/lib/drizzle"));
		await writeFileSafe(join(projectDir, "src/lib/drizzle/client.ts"), DRIZZLE_CLIENT_CONTENT);
		await writeFileSafe(join(projectDir, "src/lib/drizzle/schema.ts"), DRIZZLE_SCHEMA_CONTENT);

		const envExamplePath = join(projectDir, ".env.example");
		try {
			await readFile(envExamplePath, "utf-8");
			await appendFile(envExamplePath, ENV_EXAMPLE_CONTENT);
		} catch {
			await writeFileSafe(envExamplePath, ENV_EXAMPLE_CONTENT.trimStart());
		}
	},
};

registerIntegration(drizzleIntegration);

export { drizzleIntegration };
