import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { exec } from "../../utils/exec.js";
import { ensureDir, writeFileSafe } from "../../utils/fs.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const AUTH_TS_CONTENT = `import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [],
});
`;

const ROUTE_TS_CONTENT = `import { handlers } from "@/auth";

export const { GET, POST } = handlers;
`;

const ENV_EXAMPLE_CONTENT = `
# NextAuth (Auth.js)
AUTH_SECRET=your-auth-secret-here
AUTH_URL=http://localhost:3000
`;

const nextAuthIntegration: Integration = {
	id: "next-auth",
	name: "NextAuth (Auth.js)",
	group: "auth",
	requires: [],
	modifies: ["src/auth.ts", "src/app/api/auth/[...nextauth]/route.ts", ".env.example"],
	packages: ["next-auth@beta"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", "next-auth@beta"], {
			cwd: projectDir,
		});

		await writeFileSafe(join(projectDir, "src/auth.ts"), AUTH_TS_CONTENT);

		await ensureDir(join(projectDir, "src/app/api/auth/[...nextauth]"));
		await writeFileSafe(
			join(projectDir, "src/app/api/auth/[...nextauth]/route.ts"),
			ROUTE_TS_CONTENT,
		);

		const envExamplePath = join(projectDir, ".env.example");
		try {
			await readFile(envExamplePath, "utf-8");
			await appendFile(envExamplePath, ENV_EXAMPLE_CONTENT);
		} catch {
			await writeFileSafe(envExamplePath, ENV_EXAMPLE_CONTENT.trimStart());
		}
	},
};

registerIntegration(nextAuthIntegration);

export { nextAuthIntegration };
