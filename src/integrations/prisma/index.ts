import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { exec } from "../../utils/exec.js";
import { ensureDir, writeFileSafe } from "../../utils/fs.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const SCHEMA_PRISMA_CONTENT = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

const PRISMA_CLIENT_CONTENT = `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;

const ENV_EXAMPLE_CONTENT = `
# Prisma
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
`;

const prismaIntegration: Integration = {
	id: "prisma",
	name: "Prisma",
	group: "database",
	requires: [],
	modifies: ["prisma/schema.prisma", "src/lib/prisma.ts", ".env.example"],
	packages: ["@prisma/client"],
	devPackages: ["prisma"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", "@prisma/client"], {
			cwd: projectDir,
		});
		await exec(ctx.packageManager, ["add", "-D", "prisma"], {
			cwd: projectDir,
		});

		await ensureDir(join(projectDir, "prisma"));
		await writeFileSafe(join(projectDir, "prisma/schema.prisma"), SCHEMA_PRISMA_CONTENT);

		await writeFileSafe(join(projectDir, "src/lib/prisma.ts"), PRISMA_CLIENT_CONTENT);

		const envExamplePath = join(projectDir, ".env.example");
		try {
			await readFile(envExamplePath, "utf-8");
			await appendFile(envExamplePath, ENV_EXAMPLE_CONTENT);
		} catch {
			await writeFileSafe(envExamplePath, ENV_EXAMPLE_CONTENT.trimStart());
		}
	},
};

registerIntegration(prismaIntegration);

export { prismaIntegration };
