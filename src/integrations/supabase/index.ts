import { join } from "node:path";
import { exec } from "../../utils/exec.js";
import { writeFileSafe } from "../../utils/fs.js";
import { registerIntegration } from "../registry.js";
import type { Integration } from "../types.js";

const ENV_EXAMPLE_CONTENT = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
`;

const CLIENT_TS_CONTENT = `import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
`;

const supabaseIntegration: Integration = {
	id: "supabase",
	name: "Supabase",
	group: "database",
	requires: [],
	modifies: [".env.example", "src/lib/supabase/client.ts"],
	packages: ["@supabase/supabase-js"],
	setup: async (ctx, projectDir): Promise<void> => {
		await exec(ctx.packageManager, ["add", ...supabaseIntegration.packages], {
			cwd: projectDir,
		});

		await writeFileSafe(join(projectDir, ".env.example"), ENV_EXAMPLE_CONTENT);

		await writeFileSafe(join(projectDir, "src/lib/supabase/client.ts"), CLIENT_TS_CONTENT);
	},
};

registerIntegration(supabaseIntegration);

export { supabaseIntegration };
